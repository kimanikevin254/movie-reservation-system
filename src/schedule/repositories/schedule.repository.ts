import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class ScheduleRepository extends Repository<Schedule> {
	constructor(@InjectDataSource() dataSource: DataSource) {
		super(Schedule, dataSource.createEntityManager());
	}

	findAuditoriumSchedules(theatreId: string, auditoriumId: string) {
		return this.find({
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
		return this.find({
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
		return this.findOne({
			where: { id: scheduleId, show: { user: { id: userId } } },
			relations: ['show', 'auditorium'],
		});
	}

	findOverlappingSchedules(
		auditoriumId: string,
		startTime: Date,
		endTime: Date,
	) {
		return this.count({
			where: {
				auditorium: { id: auditoriumId },
				startTime,
				endTime,
			},
		});
	}
}
