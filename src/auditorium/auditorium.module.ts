import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { TheatreModule } from 'src/theatre/theatre.module';
import { UserModule } from 'src/user/user.module';
import { AuditoriumController } from './auditorium.controller';
import { AuditoriumService } from './auditorium.service';
import { Auditorium } from './entities/auditorium.entity';
import { AuditoriumRepository } from './repositories/auditorium.repository';

@Module({
	controllers: [AuditoriumController],
	providers: [AuditoriumService, AuditoriumRepository],
	imports: [
		TypeOrmModule.forFeature([Auditorium]),
		UserModule,
		TheatreModule,
		forwardRef(() => ScheduleModule),
	],
	exports: [AuditoriumService],
})
export class AuditoriumModule {}
