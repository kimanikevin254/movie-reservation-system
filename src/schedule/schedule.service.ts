import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { AuditoriumService } from 'src/auditorium/auditorium.service';
import { BaseService } from 'src/common/services/base.service';
import { ShowService } from 'src/show/show.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleRepository } from './repositories/schedule.repository';

@Injectable()
export class ScheduleService extends BaseService<Schedule> {
	constructor(
		private readonly scheduleRepository: ScheduleRepository,
		@Inject(forwardRef(() => ShowService))
		private readonly showService: ShowService,
		@Inject(forwardRef(() => AuditoriumService))
		private readonly auditoriumService: AuditoriumService,
	) {
		super(scheduleRepository);
	}

	async create(userId: string, dto: CreateScheduleDto) {
		// Retrieve auditorium
		const auditorium = await this.auditoriumService.findUserAuditorium(
			userId,
			dto.auditoriumId,
		);

		if (!auditorium) {
			throw new HttpException(
				'Invalid auditorium ID',
				HttpStatus.NOT_FOUND,
			);
		}

		// Retrieve the show
		const show = await this.showService.findById(dto.showId);

		if (!show) {
			throw new HttpException('Invalid Show ID', HttpStatus.NOT_FOUND);
		}

		// Dynamically calculate the end time using the show's duration
		const startTime = new Date(dto.startTime);
		const endTime = new Date(startTime.getTime() + show.duration * 60000); // Convert minutes to milliseconds

		// Check for overlapping schedules
		const conflictingSchedulesCount =
			await this.scheduleRepository.findOverlappingSchedules(
				auditorium.id,
				startTime,
				endTime,
			);

		if (conflictingSchedulesCount > 0) {
			throw new HttpException(
				`Schedule conflicts with an existing booking.`,
				HttpStatus.CONFLICT,
			);
		}

		// Create and save the schedule
		const schedule = this.scheduleRepository.create({
			show,
			auditorium,
			startTime,
			endTime,
		});

		const savedSchedule = await this.scheduleRepository.save(schedule);

		// Return sanitized response
		return this.sanitize(savedSchedule, [
			'createdAt',
			'updatedAt',
			'auditorium',
			'endTime',
			'startTime',
			'show',
		]);
	}

	findAuditoriumSchedules(theatreId: string, auditoriumId: string) {
		return this.scheduleRepository.findAuditoriumSchedules(
			theatreId,
			auditoriumId,
		);
	}

	findShowSchedules(showId: string) {
		return this.scheduleRepository.findShowSchedules(showId);
	}

	async findOne(id: string) {
		const schedule = await this.findById(id);

		if (!schedule) {
			throw new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);
		}

		return this.sanitize(schedule, ['updatedAt']);
	}

	async update(userId: string, scheduleId: string, dto: UpdateScheduleDto) {
		const schedule = await this.scheduleRepository.findOwnedSchedule(
			userId,
			scheduleId,
		);

		if (!schedule) {
			throw new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);
		}
		// Dynamically calculate the end time using the show's duration
		const startTime = new Date(dto.startTime);
		const endTime = new Date(
			startTime.getTime() + schedule.show.duration * 60000,
		);

		const conflictingSchedulesCount =
			await this.scheduleRepository.findOverlappingSchedules(
				schedule.auditorium.id,
				startTime,
				endTime,
			);

		if (conflictingSchedulesCount > 0) {
			throw new HttpException(
				`Schedule conflicts with an existing booking.`,
				HttpStatus.CONFLICT,
			);
		}

		await this.scheduleRepository.update(scheduleId, {
			startTime,
			endTime,
		});

		return;
	}

	async remove(userId: string, scheduleId: string) {
		const schedule = await this.scheduleRepository.findOwnedSchedule(
			userId,
			scheduleId,
		);

		if (!schedule) {
			throw new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);
		}

		await this.scheduleRepository.delete(schedule.id);

		return;
	}
}
