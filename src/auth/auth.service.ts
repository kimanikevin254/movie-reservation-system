import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { IUser } from 'src/common/interfaces/user.interface';
import { MailService } from 'src/common/services/mail.service';
import { UserService } from 'src/user/user.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { EmailVerificationTokenRepository } from './repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { MagicLogin } from './strategies/magic-login.strategy';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private mailService: MailService,
		private configService: ConfigService,
		@Inject(forwardRef(() => MagicLogin))
		private readonly magicLogin: MagicLogin,
		private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
	) {}

	private async generateTokens(userId: string) {
		try {
			const accessTokenTtlMins =
				this.configService.getOrThrow<number>('config.auth.jwtTtl');
			const refreshTokenTtlMins = this.configService.getOrThrow<number>(
				'config.auth.refreshTtl',
			);

			const accessToken = await this.jwtService.signAsync(
				{ sub: userId },
				{ expiresIn: accessTokenTtlMins * 60 }, // in secs
			);

			const refreshToken = randomBytes(32).toString('hex');

			// Retrieve user
			const user = await this.userService.findOneBy('id', userId);

			// Save the refresh token to db
			const newRefreshToken = this.refreshTokenRepository.create({
				token: refreshToken,
				user,
				expiresAt: new Date(
					Date.now() + refreshTokenTtlMins * 60 * 1000, // In ms
				),
			});

			await this.refreshTokenRepository.save(newRefreshToken);

			return { accessToken, refreshToken };
		} catch (error) {
			throw error;
		}
	}

	async magicLink(req: Request, res: Response) {
		const result = await this.magicLogin.send(req, res);
		console.log(result);
		return {
			message:
				'We have sent you an email with instructions to complete the process. Please check your inbox (and spam/junk folder) for the email and follow the steps provided.',
		};
	}

	async handleMagicLink(email: string) {
		const payload: IUser = { id: undefined, next_action: 'sign_in' };

		// Retrieve user
		let user = await this.userService.findOneBy('email', email);

		// If user does not exist, create them
		if (!user) {
			payload.next_action = 'complete_signup';
			user = await this.userService.create({ email });
		}

		payload.id = user.id;

		return payload;
	}

	async loginOrCompleteSignup(user: IUser) {
		if (user.next_action === 'complete_signup') {
			return {
				message:
					'Registered successfully. Please provide the additional required information.',
			};
		}

		// Generate tokens
		const tokens = await this.generateTokens(user.id);

		return {
			tokens,
			userId: user.id,
		};
	}

	async signup(dto: CompleteSignUpDto) {
		// Retrieve the user
		const user = await this.userService.findOneBy('email', dto.email);

		if (!user) {
			throw new HttpException(
				'You need to complete the magic link flow first',
				HttpStatus.UNAUTHORIZED,
			);
		}

		// Remove email from dto to avoid updating it
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { email, ...updates } = dto;

		// Update details
		await this.userService.updateUser(user.id, updates);
	}

	async refreshTokens(refreshTokensDto: RefreshTokensDto) {
		// Check if refresh token exists
		const refreshToken = await this.refreshTokenRepository.findValidToken(
			refreshTokensDto.refreshToken,
			refreshTokensDto.userId,
		);

		if (!refreshToken) {
			// Refresh token not found
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}

		// Mark old refresh token as expired
		await this.refreshTokenRepository.update(
			{ id: refreshToken.id },
			{ expiresAt: new Date() },
		);

		// Generate tokens
		const tokens = await this.generateTokens(refreshToken.user.id);

		return {
			tokens,
			userId: refreshTokensDto.userId,
		};
	}

	async logOut(logOutDto: LogOutDto) {
		const refreshToken = await this.refreshTokenRepository.findOneBy({
			token: logOutDto.refreshToken,
		});

		if (refreshToken) {
			await this.refreshTokenRepository.update(
				{ id: refreshToken.id },
				{ expiresAt: new Date() },
			);
		} else return;
	}
}
