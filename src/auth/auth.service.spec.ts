import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { IUser } from 'src/common/interfaces/user.interface';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

describe('Auth Service', () => {
	let service: AuthService;

	const mockUserService = {
		findById: jest.fn(),
		findByEmail: jest.fn(),
		create: jest.fn(),
		updateUser: jest.fn(),
	};

	const mockJwtService = {
		signAsync: jest.fn(),
	};

	const mockConfigService = {
		getOrThrow: jest.fn(),
	};

	const mockRefreshTokenRepo = {
		create: jest.fn(),
		save: jest.fn(),
		findValidToken: jest.fn(),
		update: jest.fn(),
		findOneBy: jest.fn(),
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: mockUserService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: RefreshTokenRepository,
					useValue: mockRefreshTokenRepo,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('handleMagicLink', () => {
		it('should create a user if they do not exist', async () => {
			const email = 'user@email.com';
			const payload: IUser = {
				id: '123',
				next_action: 'complete_signup',
			};
			const user: Partial<User> = {
				id: '123',
				name: 'User User',
				email: 'user@email.com',
			};

			jest.spyOn(mockUserService, 'findByEmail').mockResolvedValue(null);
			jest.spyOn(mockUserService, 'create').mockResolvedValue(user);

			const result = await service.handleMagicLink(email);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
			expect(mockUserService.create).toHaveBeenCalledWith({ email });
			expect(result).toEqual(payload);
		});

		it('should return a user if they exist', async () => {
			const email = 'user@email.com';
			const payload: IUser = {
				id: '123',
				next_action: 'sign_in',
			};
			const user: Partial<User> = {
				id: '123',
				name: 'User User',
				email: 'user@email.com',
			};

			jest.spyOn(mockUserService, 'findByEmail').mockResolvedValue(user);

			const result = await service.handleMagicLink(email);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
			expect(mockUserService.create).not.toHaveBeenCalled();
			expect(result).toEqual(payload);
		});
	});

	describe('loginOrCompleteSignup', () => {
		it('should request user to complete the signup process if they have not done so yet', async () => {
			const user: IUser = { id: '123', next_action: 'complete_signup' };
			const message = {
				userId: '123',
				message:
					'Registered successfully. Please provide the additional required information.',
			};

			const result = await service.loginOrCompleteSignup(user);

			// make sure no tokens are generated
			expect(mockJwtService.signAsync).not.toHaveBeenCalled();
			expect(result).toEqual(message);
		});

		it('should return tokens if the user has completed the signup process', async () => {
			const user: IUser = { id: '123', next_action: 'sign_in' };
			const tokens = {
				accessToken: 'access',
				refreshToken: 'refresh',
			};

			jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(
				tokens.accessToken,
			);

			// Mocking refresh token save
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue({
				token: tokens.refreshToken,
				user: user,
				expiresAt: new Date(Date.now() + 3600000),
			});

			const result = await service.loginOrCompleteSignup(user);

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
			expect(service.signup(dto)).rejects.toThrow(error);
			expect(mockUserService.findById).toHaveBeenCalledWith(dto.userId);
		});

		it('should remove user ID from dto, update user and return tokens for users who have completed magic link flow', async () => {
			const dto: CompleteSignUpDto = {
				userId: '123',
				name: 'User User',
			};
			const user: Partial<User> = {
				id: '123',
				email: 'user@emal.com',
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
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue({
				token: tokens.refreshToken,
				user: user,
				expiresAt: new Date(Date.now() + 3600000),
			});

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

			expect(service.refreshTokens(dto)).rejects.toThrow(error);
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

			const validToken: Partial<RefreshToken> = {
				id: '123',
				token: 'refresh',
				user: {
					id: '123',
				} as any,
			};

			const tokens = {
				accessToken: 'access',
				refreshToken: 'refresh',
			};

			const saveTokenResolvedValue = {
				token: tokens.refreshToken,
				user: { id: dto.userId },
				expiresAt: new Date(),
			};

			// Mocking token gen and save
			jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(
				tokens.accessToken,
			);
			jest.spyOn(mockRefreshTokenRepo, 'save').mockResolvedValue(
				saveTokenResolvedValue,
			);

			jest.spyOn(
				mockRefreshTokenRepo,
				'findValidToken',
			).mockResolvedValue(validToken);

			const result = await service.refreshTokens(dto);

			expect(mockRefreshTokenRepo.findValidToken).toHaveBeenCalledWith(
				dto.refreshToken,
				dto.userId,
			);
			expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
				{ id: validToken.id },
				{ expiresAt: saveTokenResolvedValue.expiresAt },
			);
			expect(result).toEqual({
				tokens,
				userId: dto.userId,
			});
		});
	});
});
