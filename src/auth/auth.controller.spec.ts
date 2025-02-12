import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { User } from 'src/user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { LogOutDto } from './dto/logOut.dto';
import { MagicLoginDto } from './dto/magic-login.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { MagicLoginStrategy } from './strategies/magic-login.strategy';

const moduleMocker = new ModuleMocker(global);

const user = {
	id: '123',
	name: 'User User',
	email: 'user@email.com',
} as User;

describe('Auth Controller', () => {
	let controller: AuthController;
	let authService: AuthService;
	let magicLoginStrategy: MagicLoginStrategy;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [AuthController],
		})
			.useMocker((token) => {
				if (token === MagicLoginStrategy) {
					return {
						send: jest.fn().mockResolvedValue(undefined),
					};
				}
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

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		magicLoginStrategy = module.get<MagicLoginStrategy>(MagicLoginStrategy);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('magicLinkLogin => should initiate magic login process by sending an email to provided address', async () => {
		const dto = {
			destination: user.email,
		} as MagicLoginDto;

		const mockReq = {} as Request;
		const mockRes = {} as Response;

		// Call the controller method
		controller.magicLinkLogin(mockReq, mockRes, dto);

		// Ensure `send` was called with the expected arguments
		expect(magicLoginStrategy.send).toHaveBeenCalledWith(mockReq, mockRes);
	});

	describe('magicLinkLoginCallback', () => {
		it('prompt the user to complete the signup process if they have not', async () => {
			const user = { id: '123', next_action: 'complete_signup' } as IUser;
			const token = 'token';
			const returnValue = {
				userId: user.id,
				tokens: {
					accessToken: 'access',
					refreshToken: 'refresh',
				},
			};

			jest.spyOn(authService, 'loginOrCompleteSignup').mockResolvedValue(
				returnValue,
			);

			const result = await controller.magicLinkLoginCallback(token, user);

			expect(authService.loginOrCompleteSignup).toHaveBeenCalledWith(
				user,
			);
			expect(result).toEqual(returnValue);
		});

		it('should return tokens for a user who has completed signup process', async () => {
			const user = { id: '123', next_action: 'sign_in' } as IUser;
			const token = 'token';
			const returnValue = {
				userId: user.id,
				message:
					'Registered successfully. Please provide the additional required information.',
			};

			jest.spyOn(authService, 'loginOrCompleteSignup').mockResolvedValue(
				returnValue,
			);

			const result = await controller.magicLinkLoginCallback(token, user);

			expect(authService.loginOrCompleteSignup).toHaveBeenCalledWith(
				user,
			);
			expect(result).toEqual(returnValue);
		});
	});

	it('completeSignup => should return tokens after the user provides the additional required info', async () => {
		const dto: CompleteSignUpDto = {
			userId: '123',
			name: 'User User',
		};
		const returnValue = {
			userId: user.id,
			tokens: {
				accessToken: 'access',
				refreshToken: 'refresh',
			},
		};

		jest.spyOn(authService, 'signup').mockResolvedValue(returnValue);

		const result = await controller.completeSignup(dto);

		expect(authService.signup).toHaveBeenCalledWith(dto);
		expect(result).toEqual(returnValue);
	});

	it('refreshTokens => should return new tokens', async () => {
		const dto: RefreshTokensDto = {
			userId: '123',
			refreshToken: 'refresh',
		};

		const returnValue = {
			userId: user.id,
			tokens: {
				accessToken: 'access',
				refreshToken: 'refresh',
			},
		};

		jest.spyOn(authService, 'refreshTokens').mockResolvedValue(returnValue);

		const result = await controller.refreshTokens(dto);

		expect(authService.refreshTokens).toHaveBeenCalledWith(dto);
		expect(result).toEqual(returnValue);
	});

	it('logout => should log out the user', async () => {
		const dto: LogOutDto = {
			refreshToken: 'refresh',
		};
		const user = { id: '123' } as User;

		await controller.logout(user, dto);

		expect(authService.logOut).toHaveBeenCalledWith(user.id, dto);
		expect(authService.logOut).toHaveBeenCalledTimes(1);
	});
});
