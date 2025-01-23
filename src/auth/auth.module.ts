import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationTokenRepository } from './repositories/email-verification-token.repository';

@Module({
	controllers: [AuthController],
	providers: [AuthService, EmailVerificationTokenRepository],
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
