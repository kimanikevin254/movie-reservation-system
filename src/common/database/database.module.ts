import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.getOrThrow('config.db.host'),
				port: configService.getOrThrow('config.db.port'),
				username: configService.getOrThrow('config.db.username'),
				password: configService.getOrThrow('config.db.password'),
				database: configService.getOrThrow('config.db.database'),
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule {}
