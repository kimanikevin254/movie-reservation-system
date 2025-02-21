import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketStatusDto } from '../dto/update-ticket-status.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';
import { TicketService } from '../ticket.service';
import { AdminTicketController } from './admin.ticket.controller';

const moduleMocker = new ModuleMocker(global);

describe('AdminTicketController', () => {
	let controller: AdminTicketController;
	let ticketService: TicketService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AdminTicketController],
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

		controller = module.get<AdminTicketController>(AdminTicketController);
		ticketService = module.get<TicketService>(TicketService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('create => should create a ticket', async () => {
		const user: IUser = { id: 'user-id' } as IUser;
		const scheduleId = 'schedule-id';
		const createTicketDto: CreateTicketDto = {
			name: 'ticket-name',
			description: 'ticket-description',
			price: 100,
			quantity: 100,
		};
		const result = 'ticket-id';

		jest.spyOn(ticketService, 'create').mockResolvedValue(result);

		expect(await controller.create(user, scheduleId, createTicketDto)).toBe(
			result,
		);
		expect(ticketService.create).toHaveBeenCalledWith(
			user.id,
			scheduleId,
			createTicketDto,
		);
	});

	it('findAll => should get all tickets for a schedule', async () => {
		const scheduleId = 'schedule-id';
		const result = [] as Ticket[];

		jest.spyOn(ticketService, 'findAll').mockResolvedValue(result);

		expect(await controller.findAll(scheduleId)).toBe(result);
		expect(ticketService.findAll).toHaveBeenCalledWith(scheduleId);
	});

	it('findOne => should get ticket details', async () => {
		const ticketId = 'ticket-id';
		const result = {} as Ticket;

		jest.spyOn(ticketService, 'findOne').mockResolvedValue(result);

		expect(await controller.findOne(ticketId)).toBe(result);
		expect(ticketService.findOne).toHaveBeenCalledWith(ticketId);
	});

	it('update => should update ticket details', async () => {
		const user: IUser = { id: 'user-id' } as IUser;
		const ticketId = 'ticket-id';
		const updateTicketDto: UpdateTicketDto = {
			quantity: 100,
		};
		const result = {
			message: 'Ticket updated successfully',
		};

		jest.spyOn(ticketService, 'update').mockResolvedValue(result);

		expect(await controller.update(user, ticketId, updateTicketDto)).toBe(
			result,
		);
		expect(ticketService.update).toHaveBeenCalledWith(
			user.id,
			ticketId,
			updateTicketDto,
		);
	});

	it('should update ticket status', async () => {
		const user: IUser = { id: 'user-id' } as IUser;
		const ticketId = 'ticket-id';
		const updateTicketStatusDto: UpdateTicketStatusDto = {
			status: TicketStatusEnum.ACTIVE,
		};
		const result = {
			message: 'Ticket status updated successfully',
		};

		jest.spyOn(ticketService, 'updateStatus').mockResolvedValue(result);

		expect(
			await controller.updateStatus(
				user,
				ticketId,
				updateTicketStatusDto,
			),
		).toBe(result);
		expect(ticketService.updateStatus).toHaveBeenCalledWith(
			user.id,
			ticketId,
			updateTicketStatusDto,
		);
	});

	it('should delete a ticket', async () => {
		const user: IUser = { id: 'user-id' } as IUser;
		const ticketId = 'ticket-id';
		const result = {
			message: 'Ticket deleted successfully',
		};

		jest.spyOn(ticketService, 'remove').mockResolvedValue(result);

		expect(await controller.remove(user, ticketId)).toBe(result);
		expect(ticketService.remove).toHaveBeenCalledWith(user.id, ticketId);
	});
});
