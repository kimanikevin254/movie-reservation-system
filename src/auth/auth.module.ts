import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationTokenRepository } from './repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { MagicLogin } from './strategies/magic-login.strategy';

@Module({
	controllers: [AuthController],
	providers: [
		MagicLogin,
		AuthService,
		EmailVerificationTokenRepository,
		RefreshTokenRepository,
		PasswordResetTokenRepository,
	],
	imports: [
		UserModule,
		TypeOrmModule.forFeature([
			EmailVerificationToken,
			PasswordResetToken,
			RefreshToken,
		]),
	],
})
export class AuthModule {}
