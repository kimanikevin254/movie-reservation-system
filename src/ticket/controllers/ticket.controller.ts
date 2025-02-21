import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketService } from '../ticket.service';

@Controller('schedules/:scheduleId/tickets')
@ApiTags('tickets')
export class TicketController {
	constructor(private readonly ticketService: TicketService) {}

	@Get()
	@ApiOperation({
		summary: 'Get all active tickets for a schedule',
	})
	findActiveTickets(
		@Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
	) {
		return this.ticketService.findActiveTickets(scheduleId);
	}
}
