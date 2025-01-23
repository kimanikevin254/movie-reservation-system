import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import configuration from 'src/common/config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
		}),
		CommonModule,
		// JwtModule.registerAsync({
		// 	useFactory: async (configService: ConfigService) => {
		// 		console.log('JwtModule useFactory called');
		// 		return {
		// 			secret: configService.get<string>('config.jwtSecret'),
		// 			global: true,
		// 		};
		// 	},
		// 	inject: [ConfigService],
		// }),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
		}),
		ThrottlerModule.forRoot([
			{
				ttl: minutes(5),
				limit: 10,
			},
		]),
		AuthModule,
		UserModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
