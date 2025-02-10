import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { MagicLoginStrategy } from './strategies/magic-login.strategy';

@Module({
	controllers: [AuthController],
	providers: [MagicLoginStrategy, AuthService, RefreshTokenRepository],
	imports: [UserModule, TypeOrmModule.forFeature([RefreshToken])],
})
export class AuthModule {}
