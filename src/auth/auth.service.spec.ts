import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

const moduleMocker = new ModuleMocker(global);

const user = {
	id: '123',
	name: 'User User',
	email: 'user@email.com',
} as User;

const refreshToken = {
	id: '123',
	token: 'refresh',
	expiresAt: new Date(),
	user,
} as RefreshToken;

describe('Auth Service', () => {
	let service: AuthService;
	let mockUserService: UserService;
	let mockJwtService: JwtService;
	let mockRefreshTokenRepo: RefreshTokenRepository;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [AuthService],
		})
			.useMocker((token) => {
				if (typeof token === 'function') {
					const mockMetadata = moduleMocker.getMetadata(
						token,
					) as MockFunctionMetadata<any, any>;
					const Mock =
						moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		service = module.get<AuthService>(AuthService);
		mockUserService = module.get<UserService>(UserService);
		mockJwtService = module.get<JwtService>(JwtService);
		mockRefreshTokenRepo = module.get<RefreshTokenRepository>(
			RefreshTokenRepository,
		);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('handleMagicLink', () => {
		it('should create a user if they do not exist', async () => {
			const email = 'user@email.com';

			jest.spyOn(mockUserService, 'findByEmail').mockResolvedValue(null);
			jest.spyOn(mockUserService, 'create').mockResolvedValue(user);

			const result = await service.handleMagicLink(email);

			console.log('Result', result);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
			expect(mockUserService.create).toHaveBeenCalledWith({ email });
			expect(result).toEqual({
				id: '123',
				next_action: 'complete_signup',
			} as IUser);
		});

		it('should return a user if they exist', async () => {
			const email = 'user@email.com';

			jest.spyOn(mockUserService, 'findByEmail').mockResolvedValue(user);

			const result = await service.handleMagicLink(email);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
			expect(mockUserService.create).not.toHaveBeenCalled();
			expect(result).toEqual({
				id: '123',
				next_action: 'sign_in',
			} as IUser);
		});
	});

	describe('loginOrCompleteSignup', () => {
		it('should request user to complete the signup process if they have not done so yet', async () => {
			const payload: IUser = {
				id: '123',
				next_action: 'complete_signup',
			};

			const message = {
				userId: '123',
				message:
					'Registered successfully. Please provide the additional required information.',
			};

			const result = await service.loginOrCompleteSignup(payload);

			// make sure no tokens are generated
			expect(mockJwtService.signAsync).not.toHaveBeenCalled();
			expect(result).toEqual(message);
		});

		it('should return tokens if the user has completed the signup process', async () => {
			const payload: IUser = { id: '123', next_action: 'sign_in' };

			const tokens = {
				accessToken: 'access',
				refreshToken: 'refresh',
			};

			jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(
				tokens.accessToken,
			);

			// Mocking refresh token save
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue(
				refreshToken,
			);

			const result = await service.loginOrCompleteSignup(payload);

			expect(result).toEqual({
				tokens: {
					accessToken: 'access',
					refreshToken: 'refresh',
				},
				userId: '123',
			});
		});
	});

	describe('signup', () => {
		it('should throw error if user has not completed magic link flow first', async () => {
			const dto: CompleteSignUpDto = {
				userId: '123',
				name: 'User User',
			};

			const error = new HttpException(
				'Unauthorized. You need to complete the magic link flow first',
				HttpStatus.UNAUTHORIZED,
			);

			jest.spyOn(mockUserService, 'findById').mockResolvedValue(null);

			// Expect method to throw a HTTP exception
			await expect(service.signup(dto)).rejects.toThrow(error);
			expect(mockUserService.findById).toHaveBeenCalledWith(dto.userId);
		});

		it('should remove user ID from dto, update user and return tokens for users who have completed magic link flow', async () => {
			const dto: CompleteSignUpDto = {
				userId: '123',
				name: 'User User',
			};
			const tokens = {
				accessToken: 'access',
				refreshToken: 'refresh',
			};

			jest.spyOn(mockUserService, 'findById').mockResolvedValue(user);

			// Mocking token gen and save
			jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(
				tokens.accessToken,
			);
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue(
				refreshToken,
			);

			const result = await service.signup(dto);

			expect(mockUserService.findById).toHaveBeenCalledWith(dto.userId);
			expect(mockUserService.updateUser).toHaveBeenCalledWith(user.id, {
				name: dto.name,
			});
			expect(result).toEqual({
				tokens,
				userId: '123',
			});
		});
	});

	describe('refreshTokens', () => {
		it('should throw HTTP unauthorized error for invalid tokens', async () => {
			const dto: RefreshTokensDto = {
				userId: '123',
				refreshToken: 'refresh',
			};

			const error = new HttpException(
				'Unauthorized',
				HttpStatus.UNAUTHORIZED,
			);

			jest.spyOn(
				mockRefreshTokenRepo,
				'findValidToken',
			).mockResolvedValue(null);

			await expect(service.refreshTokens(dto)).rejects.toThrow(error);
			expect(mockRefreshTokenRepo.findValidToken).toHaveBeenCalledWith(
				dto.refreshToken,
				dto.userId,
			);
		});

		it('should mark old token as expired, and return new tokens', async () => {
			const dto: RefreshTokensDto = {
				userId: '123',
				refreshToken: 'refresh',
			};

			const newTokens = {
				accessToken: 'access1',
				refreshToken: 'refresh1',
			};

			const savedRefreshToken = {
				id: '345',
				token: 'refresh1',
				expiresAt: new Date(Date.now() + 50 * 60 * 1000),
			} as RefreshToken;

			jest.spyOn(
				mockRefreshTokenRepo,
				'findValidToken',
			).mockResolvedValue(refreshToken);
			jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(
				newTokens.accessToken,
			);
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue(
				savedRefreshToken,
			);

			const result = await service.refreshTokens(dto);

			expect(mockRefreshTokenRepo.findValidToken).toHaveBeenCalledWith(
				dto.refreshToken,
				dto.userId,
			);
			expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
				{ id: refreshToken.id },
				{ expiresAt: expect.any(Date) },
			);
			expect(result).toEqual({ tokens: newTokens, userId: user.id });
		});
	});

	describe('logout', () => {
		it('should not update the DB if the refresh token is not valid', async () => {
			const dto = {
				refreshToken: 'invalid',
			} as LogOutDto;

			jest.spyOn(
				mockRefreshTokenRepo,
				'findValidToken',
			).mockResolvedValue(null);

			await service.logOut(user.id, dto);

			expect(mockRefreshTokenRepo.update).not.toHaveBeenCalled();
		});

		it('should mark the refresh token in the DB as expired', async () => {
			const dto = {
				refreshToken: 'valid',
			} as LogOutDto;

			jest.spyOn(
				mockRefreshTokenRepo,
				'findValidToken',
			).mockResolvedValue(refreshToken);

			await service.logOut(user.id, dto);

			expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
				{ id: refreshToken.id },
				{ expiresAt: expect.any(Date) },
			);
		});
	});
});
