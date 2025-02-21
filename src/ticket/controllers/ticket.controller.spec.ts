import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Ticket } from '../entities/ticket.entity';
import { TicketService } from '../ticket.service';
import { TicketController } from './ticket.controller';

const moduleMocker = new ModuleMocker(global);

describe('TicketController', () => {
	let controller: TicketController;
	let ticketService: TicketService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TicketController],
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

		controller = module.get<TicketController>(TicketController);
		ticketService = module.get<TicketService>(TicketService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('findActiveTickets', async () => {
		const scheduleId = 'schedule-id';
		const result = [
			{
				id: 'ticket-id',
			},
		] as Ticket[];

		jest.spyOn(ticketService, 'findActiveTickets').mockResolvedValue(
			result,
		);

		expect(await controller.findActiveTickets(scheduleId)).toBe(result);
	});
});
