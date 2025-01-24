import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from 'src/common/services/mail.service';
import { UserService } from 'src/user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LogInDto } from './dto/login.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignUpDto } from './dto/signup.dto';
import { EmailVerificationTokenRepository } from './repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private mailService: MailService,
		private configService: ConfigService,
		private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
	) {}

	private async hashPassword(password: string) {
		const saltOrRounds = 10;
		return await bcrypt.hash(password, saltOrRounds);
	}

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

	async signup(signUpDto: SignUpDto) {
		try {
			const passwordHash = await this.hashPassword(signUpDto.password);

			const user = await this.userService.create({
				name: signUpDto.name,
				email: signUpDto.email,
				passwordHash,
			});

			// Generate email verification token
			const verificationToken = randomBytes(32).toString('hex');

			// Save the token
			const newVerificationToken =
				this.emailVerificationTokenRepository.create({
					token: verificationToken,
					user,
					expiresAt: new Date(
						Date.now() +
							this.configService.getOrThrow<number>(
								'config.mail.linksTtl.verification',
							) *
								60 *
								1000,
					),
				});

			await this.emailVerificationTokenRepository.save(
				newVerificationToken,
			);

			// Send a email verification link
			await this.mailService.sendEmailVerification(
				user.email,
				user.name,
				`${this.configService.get<string>(
					'config.mail.links.emailVerification',
				)}?token=${verificationToken}`,
			);

			return {
				message:
					'Click the link sent to the provided email address to verify your account',
			};
		} catch (error) {
			throw error;
		}
	}

	async verifyEmail(token: string) {
		// Check if token is valid
		const validToken =
			await this.emailVerificationTokenRepository.findValidToken(token);

		console.log(validToken);

		if (!validToken) {
			throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
		}

		// Mark user's email as verified
		await this.userService.updateUser(validToken.user.id, {
			emailVerifiedAt: new Date(),
		});

		// Expire the token
		await this.emailVerificationTokenRepository.update(
			{
				id: validToken.id,
			},
			{
				expiresAt: new Date(),
			},
		);

		// Generate tokens
		const tokens = await this.generateTokens(validToken.user.id);

		return {
			tokens,
			userId: validToken.user.id,
		};
	}

	async login(logInDto: LogInDto) {
		// Retrieve user
		const user = await this.userService.findOneBy('email', logInDto.email);

		if (!user) {
			throw new HttpException(
				'Incorrect credentials', // Don't tell the user that the user does not exist
				HttpStatus.UNAUTHORIZED,
			);
		}

		// Check if password matches
		const passwordMatches = await bcrypt.compare(
			logInDto.password,
			user.passwordHash,
		);

		if (!passwordMatches) {
			throw new HttpException(
				'Incorrect credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}

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

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		const user = await this.userService.findOneBy('id', userId);

		if (!user) {
			throw new HttpException(
				'User does not exist',
				HttpStatus.NOT_FOUND,
			);
		}

		// Check if user password is same as provided old password
		const passwordMatches = await bcrypt.compare(
			changePasswordDto.oldPassword,
			user.passwordHash,
		);

		if (!passwordMatches) {
			throw new HttpException(
				'Passwords do not match',
				HttpStatus.BAD_REQUEST,
			);
		}

		const passwordHash = await this.hashPassword(
			changePasswordDto.newPassword,
		);

		// Update user password
		await this.userService.updateUser(userId, { passwordHash });

		return {
			message: 'Password updated successfully',
		};
	}

	async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
		try {
			// Make sure user exists
			const user = await this.userService.findOneBy(
				'email',
				forgetPasswordDto.email,
			);

			if (user) {
				// Generate a password rest token
				const passwordResetToken = randomBytes(32).toString('hex');

				// Save the password reset token to db
				const newPasswordResetToken =
					this.passwordResetTokenRepository.create({
						token: passwordResetToken,
						user,
						expiresAt: new Date(
							Date.now() +
								this.configService.getOrThrow<number>(
									'config.mail.linksTtl.passwordReset',
								) *
									60 *
									1000,
						),
					});

				await this.passwordResetTokenRepository.save(
					newPasswordResetToken,
				);

				// Send email
				await this.mailService.sendPasswordResetMail(
					forgetPasswordDto.email,
					user.name,
					`${this.configService.getOrThrow<string>('config.mail.links.passwordReset')}?token=${passwordResetToken}`,
				);
			}

			return {
				message:
					'If this email address is registered, you will receive a password reset link.',
			};
		} catch (error) {
			throw error;
		}
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		// Check if token exists
		const passwordResetToken =
			await this.passwordResetTokenRepository.findValidToken(
				resetPasswordDto.token,
			);

		if (!passwordResetToken) {
			throw new HttpException(
				'Invalid password reset token',
				HttpStatus.BAD_REQUEST,
			);
		}

		// Reset user's password
		const hashedPassword = await this.hashPassword(
			resetPasswordDto.password,
		);

		await this.userService.updateUser(passwordResetToken.user.id, {
			passwordHash: hashedPassword,
		});

		// Invalidate the token
		await this.passwordResetTokenRepository.update(
			{ id: passwordResetToken.id },
			{ expiresAt: new Date() },
		);

		return {
			message:
				'Password reset successfully. You can now log in with your new credentials',
		};
	}
}
