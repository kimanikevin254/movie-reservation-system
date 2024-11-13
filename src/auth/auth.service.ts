import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from 'src/common/services/mail.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LogInDto } from './dto/login.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private prismaService: PrismaService,
		private mailService: MailService,
	) {}

	private async hashPassword(password: string) {
		const saltOrRounds = 10;
		return await bcrypt.hash(password, saltOrRounds);
	}

	private async generateTokens(userId: string) {
		const accessToken = await this.jwtService.signAsync(
			{ sub: userId },
			{ expiresIn: '1h' },
		);

		const refreshToken = randomBytes(32).toString('hex');

		// Save the refresh token to db
		await this.prismaService.refreshToken.create({
			data: {
				token: refreshToken,
				userId,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});

		return { accessToken, refreshToken };
	}

	private async retrieveRefreshToken(data: Prisma.RefreshTokenWhereInput) {
		return this.prismaService.refreshToken.findFirst({
			where: { ...data },
		});
	}

	async signup(signUpDto: SignUpDto) {
		const passwordHash = await this.hashPassword(signUpDto.password);

		const user = await this.userService.create({
			name: signUpDto.name,
			email: signUpDto.email,
			passwordHash,
		});

		// Generate tokens
		const tokens = await this.generateTokens(user.id);

		return {
			tokens,
			userId: user.id,
		};
	}

	async login(logInDto: LogInDto) {
		// Retrieve user
		const user = await this.userService.findUserByUniqueAttribute({
			email: logInDto.email,
		});

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
		const refreshToken = await this.retrieveRefreshToken({
			token: refreshTokensDto.refreshToken,
			userId: refreshTokensDto.userId,
			expiresAt: {
				gte: new Date(), // Check that expiresAt is greater than or equal to the current date
			},
		});

		if (!refreshToken) {
			// Refresh token not found
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}

		// Mark old refresh token as expired
		await this.prismaService.refreshToken.update({
			where: {
				id: refreshToken.id,
			},
			data: {
				expiresAt: new Date(),
			},
		});

		// Generate tokens
		const tokens = await this.generateTokens(refreshTokensDto.userId);

		return {
			tokens,
			userId: refreshTokensDto.userId,
		};
	}

	async logOut(logOutDto: LogOutDto) {
		const refreshToken = await this.retrieveRefreshToken({
			token: logOutDto.refreshToken,
		});

		if (refreshToken) {
			await this.prismaService.refreshToken.update({
				where: {
					token: logOutDto.refreshToken,
				},
				data: {
					expiresAt: new Date(),
				},
			});
		} else return;
	}

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		const user = await this.userService.findUserByUniqueAttribute({
			id: userId,
		});

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
		// Make sure user exists
		const user = await this.userService.findUserByUniqueAttribute({
			email: forgetPasswordDto.email,
		});

		if (user) {
			// Generate a password rest token
			const passwordResetToken = randomBytes(32).toString('hex');

			// Save the password reset token to db
			await this.prismaService.passwordResetToken.create({
				data: {
					token: passwordResetToken,
					userId: user.id,
					expiresAt: new Date(Date.now() + 10 * 60 * 1000),
				},
			});

			// Send email
			await this.mailService.sendPasswordResetMail(
				forgetPasswordDto.email,
				user.name,
				`http://localhost:3000/auth/reset-password?token=${passwordResetToken}`,
			);
		}

		return {
			message:
				'If this email address is registered, you will receive a password reset link.',
		};
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		// Check if token exists
		const passwordResetToken =
			await this.prismaService.passwordResetToken.findFirst({
				where: {
					token: resetPasswordDto.token,
					expiresAt: {
						gte: new Date(),
					},
				},
				include: {
					user: {
						select: {
							id: true,
						},
					},
				},
			});

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
		await this.prismaService.passwordResetToken.update({
			where: { id: passwordResetToken.id },
			data: { expiresAt: new Date() },
		});

		return {
			message:
				'Password reset successfully. You can now log in with your new credentials',
		};
	}
}
