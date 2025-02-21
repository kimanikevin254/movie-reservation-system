import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import configuration from 'src/common/config/configuration';
import { AppController } from './app.controller';
import { AuditoriumModule } from './auditorium/auditorium.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ShowModule } from './show/show.module';
import { TheatreModule } from './theatre/theatre.module';
import { UserModule } from './user/user.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
		}),
		CommonModule,
		BullModule.forRootAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					connection: {
						host: configService.getOrThrow<string>(
							'config.redis.host',
						),
						port: configService.getOrThrow<number>(
							'config.redis.port',
						),
					},
				};
			},
			inject: [ConfigService],
		}),
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
		TheatreModule,
		AuditoriumModule,
		ShowModule,
		ScheduleModule,
		TicketModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
