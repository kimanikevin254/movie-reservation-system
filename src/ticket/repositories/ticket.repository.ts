import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
	constructor(@InjectDataSource() dataSource: DataSource) {
		super(Ticket, dataSource.createEntityManager());
	}

	findUserOwnedTicket(userId: string, ticketId: string) {
		return this.findOne({
			where: {
				id: ticketId,
				schedule: { show: { user: { id: userId } } },
			},
			relations: ['schedule', 'schedule.show', 'schedule.show.user'],
		});
	}

	findActiveTickets(scheduleId: string) {
		return this.find({
			where: {
				schedule: { id: scheduleId },
				status: TicketStatusEnum.ACTIVE,
			},
			select: {
				id: true,
				name: true,
				description: true,
				price: true,
			},
		});
	}

	findScheduleTickets(scheduleId: string) {
		return this.find({
			where: { schedule: { id: scheduleId } },
			relations: ['schedule'],
		});
	}

	countCreatedScheduleTickets(scheduleId: string) {
		return this.count({ where: { schedule: { id: scheduleId } } });
	}
}
