import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { IUser } from 'src/common/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private readonly refreshTokenRepository: RefreshTokenRepository,
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
			const user = await this.userService.findById(userId);

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

	async handleMagicLink(email: string) {
		const payload: IUser = { id: undefined, next_action: 'sign_in' };

		// Retrieve user
		let user = await this.userService.findByEmail(email);

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
				userId: user.id,
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
		const user = await this.userService.findById(dto.userId);

		if (!user) {
			throw new HttpException(
				'Unauthorized. You need to complete the magic link flow first',
				HttpStatus.UNAUTHORIZED,
			);
		}

		// Remove userId from dto to avoid updating it
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { userId, ...updates } = dto;

		// Update details
		await this.userService.updateUser(user.id, updates);

		// Generate tokens
		const tokens = await this.generateTokens(user.id);

		return {
			tokens,
			userId: user.id,
		};
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
