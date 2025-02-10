import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class ScheduleRepository extends Repository<Schedule> {
	constructor(
		@InjectRepository(Schedule)
		private readonly scheduleRepository: Repository<Schedule>,
	) {
		super(
			scheduleRepository.target,
			scheduleRepository.manager,
			scheduleRepository.queryRunner,
		);
	}

	findAuditoriumSchedules(theatreId: string, auditoriumId: string) {
		return this.scheduleRepository.find({
			where: {
				auditorium: { id: auditoriumId, theatre: { id: theatreId } },
			},
			select: {
				id: true,
				startTime: true,
				endTime: true,
				show: {
					id: true,
					name: true,
					duration: true,
				},
			},
			relations: ['show'],
		});
	}

	findShowSchedules(showId: string) {
		return this.scheduleRepository.find({
			where: { show: { id: showId } },
			select: {
				id: true,
				startTime: true,
				endTime: true,
				auditorium: {
					id: true,
					name: true,
					theatre: {
						id: true,
						name: true,
					},
				},
			},
			relations: ['auditorium', 'auditorium.theatre'],
		});
	}

	findOwnedSchedule(userId: string, scheduleId: string) {
		return this.scheduleRepository.findOne({
			where: { id: scheduleId, show: { user: { id: userId } } },
			relations: ['show', 'show.user'],
		});
	}
}
