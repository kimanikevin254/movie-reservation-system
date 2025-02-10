import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { TheatreModule } from 'src/theatre/theatre.module';
import { UserModule } from 'src/user/user.module';
import { Show } from './entities/show.entity';
import { ShowRepository } from './repositories/show.repository';
import { ShowController } from './show.controller';
import { ShowService } from './show.service';

@Module({
	controllers: [ShowController],
	providers: [ShowService, ShowRepository],
	imports: [
		TypeOrmModule.forFeature([Show]),
		forwardRef(() => UserModule),
		forwardRef(() => TheatreModule),
		forwardRef(() => ScheduleModule),
	],
	exports: [ShowService],
})
export class ShowModule {}
