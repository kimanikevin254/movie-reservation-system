import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketStatusDto } from '../dto/update-ticket-status.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketService } from '../ticket.service';

@Controller('/admin/:scheduleId/tickets')
@ApiBearerAuth()
@ApiTags('admin-tickets')
@UseGuards(AuthGuard)
export class AdminTicketController {
	constructor(private readonly ticketService: TicketService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a ticket for a schedule',
	})
	create(
		@User() user: IUser,
		@Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
		@Body() createTicketDto: CreateTicketDto,
	) {
		return this.ticketService.create(user.id, scheduleId, createTicketDto);
	}

	@Get()
	@ApiOperation({
		summary: 'Get all tickets for a schedule',
	})
	findAll(@Param('scheduleId', new ParseUUIDPipe()) scheduleId: string) {
		return this.ticketService.findAll(scheduleId);
	}

	@Get(':ticketId')
	@ApiOperation({
		summary: 'Get ticket details',
	})
	findOne(@Param('ticketId', new ParseUUIDPipe()) ticketId: string) {
		return this.ticketService.findOne(ticketId);
	}

	@Patch(':ticketId')
	@ApiOperation({
		summary: 'Update ticket details',
	})
	update(
		@User() user: IUser,
		@Param('ticketId', new ParseUUIDPipe()) ticketId: string,
		@Body() dto: UpdateTicketDto,
	) {
		return this.ticketService.update(user.id, ticketId, dto);
	}

	@Patch(':ticketId/status')
	@ApiOperation({
		summary: 'Update ticket status',
	})
	updateStatus(
		@User() user: IUser,
		@Param('ticketId', new ParseUUIDPipe()) ticketId: string,
		@Body() dto: UpdateTicketStatusDto,
	) {
		return this.ticketService.updateStatus(user.id, ticketId, dto);
	}

	@Delete(':ticketId')
	@ApiOperation({
		summary: 'Delete a ticket',
	})
	remove(@User() user: IUser, @Param('ticketId') ticketId: string) {
		return this.ticketService.remove(user.id, ticketId);
	}
}
