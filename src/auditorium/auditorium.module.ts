import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheatreModule } from 'src/theatre/theatre.module';
import { UserModule } from 'src/user/user.module';
import { AuditoriumController } from './auditorium.controller';
import { AuditoriumService } from './auditorium.service';
import { Auditorium } from './entities/auditorium.entity';

@Module({
	controllers: [AuditoriumController],
	providers: [AuditoriumService],
	imports: [
		TypeOrmModule.forFeature([Auditorium]),
		UserModule,
		TheatreModule,
	],
})
export class AuditoriumModule {}
