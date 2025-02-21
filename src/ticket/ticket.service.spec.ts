import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { ScheduleService } from 'src/schedule/schedule.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';
import { TicketRepository } from './repositories/ticket.repository';
import { TicketService } from './ticket.service';

const moduleMocker = new ModuleMocker(global);

const schedule = {
	auditorium: {
		seatMap: {
			rows: [
				{
					row: 'A',
					seats: [
						{
							column: 1,
							seatNumber: 'A1',
						},
						{
							column: 2,
							seatNumber: 'A2',
						},
					],
				},
			],
		},
	},
} as Schedule;

const ticket = {
	id: 'ticketId',
	name: 'ticket-name',
	description: 'ticket-description',
	price: 100,
	quantity: 100,
} as Ticket;

const user = { id: '123' } as IUser;

describe('TicketService', () => {
	let service: TicketService;
	let ticketRepository: TicketRepository;
	let scheduleService: ScheduleService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TicketService, ScheduleService],
		})
			.useMocker((token) => {
				if (typeof token === 'function') {
					const mockMetadata = moduleMocker.getMetadata(
						token,
					) as MockFunctionMetadata<any, any>;
					const Mock =
						moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		service = module.get<TicketService>(TicketService);
		ticketRepository = module.get<TicketRepository>(TicketRepository);
		scheduleService = module.get<ScheduleService>(ScheduleService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('findAll => should find all schedule tickets', async () => {
		const scheduleId = 'scheduleId';
		const result = [ticket];

		jest.spyOn(ticketRepository, 'findScheduleTickets').mockResolvedValue(
			result,
		);

		expect(await service.findAll(scheduleId)).toBe(result);
	});

	it('findOne => should find ticket details', async () => {
		const ticketId = 'ticketId';
		const result = ticket;

		jest.spyOn(service, 'findById').mockResolvedValue(result);

		expect(await service.findOne(ticketId)).toBe(result);
	});

	it('findActiveTickets => should find all active tickets', async () => {
		const scheduleId = 'scheduleId';
		const result = [ticket];

		jest.spyOn(ticketRepository, 'findActiveTickets').mockResolvedValue(
			result,
		);

		expect(await service.findActiveTickets(scheduleId)).toBe(result);
	});

	describe('create', () => {
		it('should throw an error if schedule is not found', async () => {
			jest.spyOn(scheduleService, 'findOwnedSchedule').mockResolvedValue(
				null,
			);

			await expect(
				service.create(user.id, schedule.id, new CreateTicketDto()),
			).rejects.toThrow(
				new HttpException('Invalid schedule ID', HttpStatus.NOT_FOUND),
			);
		});

		it('should throw an error if quantity exceeds remaining seats', async () => {
			jest.spyOn(scheduleService, 'findOwnedSchedule').mockResolvedValue(
				schedule,
			);
			jest.spyOn(
				ticketRepository,
				'countCreatedScheduleTickets',
			).mockResolvedValue(2);

			const dto = new CreateTicketDto();
			dto.quantity = 3;

			await expect(
				service.create('userId', 'scheduleId', dto),
			).rejects.toThrow(
				new HttpException(
					'Cannot create 3 tickets. Only 0 more tickets can be created.',
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it('should create and save a ticket', async () => {
			jest.spyOn(scheduleService, 'findOwnedSchedule').mockResolvedValue(
				schedule,
			);
			jest.spyOn(
				ticketRepository,
				'countCreatedScheduleTickets',
			).mockResolvedValue(1);
			jest.spyOn(ticketRepository, 'create').mockReturnValue(ticket);
			jest.spyOn(ticketRepository, 'save').mockResolvedValue(ticket);

			const dto = new CreateTicketDto();
			dto.quantity = 1;

			const result = await service.create(user.id, schedule.id, dto);

			expect(result).toBe(ticket.id);
		});
	});

	describe('update', () => {
		it('should throw an error if ticket is not found', async () => {
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(null);

			await expect(
				service.update(user.id, ticket.id, new UpdateTicketDto()),
			).rejects.toThrow(
				new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND),
			);
		});

		it('should throw an error if ticket is not in draft status', async () => {
			const ticket = { status: TicketStatusEnum.ACTIVE } as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);

			await expect(
				service.update(user.id, ticket.id, new UpdateTicketDto()),
			).rejects.toThrow(
				new HttpException(
					'Ticket cannot be updated. Only tickets in draft status can be updated.',
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it('should update the ticket', async () => {
			const ticket = {
				id: 'ticketId',
				status: TicketStatusEnum.DRAFT,
			} as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);
			jest.spyOn(ticketRepository, 'update').mockResolvedValue(null);

			const dto = new UpdateTicketDto();

			const result = await service.update('userId', 'ticketId', dto);

			expect(result).toEqual({ message: 'Ticket updated successfully' });
		});
	});

	describe('updateStatus', () => {
		it('should throw an error if ticket is not found', async () => {
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(null);

			await expect(
				service.updateStatus(
					'userId',
					'ticketId',
					new UpdateTicketStatusDto(),
				),
			).rejects.toThrow(
				new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND),
			);
		});

		it('should throw an error if trying to revert active/inactive ticket to draft', async () => {
			const ticket = { status: TicketStatusEnum.ACTIVE } as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);

			const dto = new UpdateTicketStatusDto();
			dto.status = TicketStatusEnum.DRAFT;

			await expect(
				service.updateStatus('userId', 'ticketId', dto),
			).rejects.toThrow(
				new HttpException(
					'ACTIVE/INACTIVE ticket cannot be updated to DRAFT',
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it('should update the ticket status', async () => {
			const ticket = {
				id: 'ticketId',
				status: TicketStatusEnum.DRAFT,
			} as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);
			jest.spyOn(ticketRepository, 'update').mockResolvedValue(null);

			const dto = new UpdateTicketStatusDto();
			dto.status = TicketStatusEnum.ACTIVE;

			const result = await service.updateStatus(
				'userId',
				'ticketId',
				dto,
			);

			expect(result).toEqual({
				message: 'Ticket status updated successfully',
			});
		});
	});

	describe('remove', () => {
		it('should throw an error if ticket is not found', async () => {
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(null);

			await expect(service.remove('userId', 'ticketId')).rejects.toThrow(
				new HttpException('Invalid ticket ID', HttpStatus.NOT_FOUND),
			);
		});

		it('should throw an error if ticket is not in draft status', async () => {
			const ticket = { status: TicketStatusEnum.ACTIVE } as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);

			await expect(service.remove('userId', 'ticketId')).rejects.toThrow(
				new HttpException(
					'Ticket cannot be deleted. Only tickets in draft status can be deleted. If you want to cancel an active ticket, please consider changing the status to INACTIVE.',
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it('should remove the ticket', async () => {
			const ticket = {
				id: 'ticketId',
				status: TicketStatusEnum.DRAFT,
			} as Ticket;
			jest.spyOn(
				ticketRepository,
				'findUserOwnedTicket',
			).mockResolvedValue(ticket);
			jest.spyOn(ticketRepository, 'remove').mockResolvedValue(null);

			const result = await service.remove('userId', 'ticketId');

			expect(result).toEqual({ message: 'Ticket deleted successfully' });
		});
	});
});
