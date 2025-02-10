import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriumModule } from 'src/auditorium/auditorium.module';
import { ShowModule } from 'src/show/show.module';
import { UserModule } from 'src/user/user.module';
import { Schedule } from './entities/schedule.entity';
import { ScheduleRepository } from './repositories/schedule.repository';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
	controllers: [ScheduleController],
	providers: [ScheduleService, ScheduleRepository],
	imports: [
		TypeOrmModule.forFeature([Schedule]),
		UserModule,
		ShowModule,
		forwardRef(() => AuditoriumModule),
	],
	exports: [ScheduleService],
})
export class ScheduleModule {}
