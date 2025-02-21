import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';
import { TicketRepository } from './repositories/ticket.repository';

@Injectable()
export class TicketService extends BaseService<Ticket> {
	constructor(
		private readonly scheduleService: ScheduleService,
		private readonly ticketRepository: TicketRepository,
	) {
		super(ticketRepository);
	}

	async create(userId: string, scheduleId: string, dto: CreateTicketDto) {
		// Retrieve user owned schedule
		const schedule = await this.scheduleService.findOwnedSchedule(
			userId,
			scheduleId,
		);

		if (!schedule) {
			throw new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);
		}

		// Calculate total seats in the auditorium
		const auditoriumSeatCount = schedule.auditorium.seatMap.rows.reduce(
			(acc, row) => acc + row.seats.length,
			0,
		);

		// Count already created tickets for the schedule
		const ticketsCount =
			await this.ticketRepository.countCreatedScheduleTickets(scheduleId);
		const remainingSeats = auditoriumSeatCount - ticketsCount;

		if (dto.quantity > remainingSeats) {
			throw new HttpException(
				`Cannot create ${dto.quantity} tickets. Only ${remainingSeats} more tickets can be created.`,
				HttpStatus.BAD_REQUEST,
			);
		}

		// Create ticket
		const ticket = this.ticketRepository.create({
			...dto,
			schedule,
		});

		const savedTicket = await this.ticketRepository.save(ticket);

		return savedTicket.id;
	}

	findAll(scheduleId: string) {
		return this.ticketRepository.findScheduleTickets(scheduleId);
	}

	findOne(ticketId: string) {
		return this.findById(ticketId);
	}

	async update(userId: string, ticketId: string, dto: UpdateTicketDto) {
		// Retrieve user owned ticket
		const ticket = await this.ticketRepository.findUserOwnedTicket(
			userId,
			ticketId,
		);

		if (!ticket) {
			throw new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND);
		}

		// Do not allow updating tickets that are not in draft status
		if (ticket.status !== TicketStatusEnum.DRAFT) {
			throw new HttpException(
				'Ticket cannot be updated. Only tickets in draft status can be updated.',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.ticketRepository.update(ticket.id, dto);

		return { message: 'Ticket updated successfully' };
	}

	async updateStatus(
		userId: string,
		ticketId: string,
		dto: UpdateTicketStatusDto,
	) {
		// Retrieve user owned ticket
		const ticket = await this.ticketRepository.findUserOwnedTicket(
			userId,
			ticketId,
		);

		if (!ticket) {
			throw new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND);
		}

		// Active ticket cannot be reverted to draft mode. Only to inactive mode
		// Inactive ticket cannot be reverted to draft mode. Only to active mode
		if (
			(ticket.status === TicketStatusEnum.ACTIVE &&
				dto.status === TicketStatusEnum.DRAFT) ||
			(ticket.status === TicketStatusEnum.INACTIVE &&
				dto.status === TicketStatusEnum.DRAFT)
		) {
			throw new HttpException(
				'ACTIVE/INACTIVE ticket cannot be updated to DRAFT',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.ticketRepository.update(ticket.id, { status: dto.status });

		return { message: 'Ticket status updated successfully' };
	}

	async remove(userId: string, ticketId: string) {
		// Retrieve user owned ticket
		const ticket = await this.ticketRepository.findUserOwnedTicket(
			userId,
			ticketId,
		);

		if (!ticket) {
			throw new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND);
		}

		if (ticket.status !== TicketStatusEnum.DRAFT) {
			throw new HttpException(
				'Ticket cannot be deleted. Only tickets in draft status can be deleted. If you want to cancel an active ticket, please consider changing the status to INACTIVE.',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.ticketRepository.remove(ticket);

		return { message: 'Ticket deleted successfully' };
	}

	findActiveTickets(scheduleId: string) {
		return this.ticketRepository.findActiveTickets(scheduleId);
	}
}
