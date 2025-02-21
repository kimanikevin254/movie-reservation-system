import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { AdminTicketController } from './controllers/admin.ticket.controller';
import { TicketController } from './controllers/ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketRepository } from './repositories/ticket.repository';
import { TicketService } from './ticket.service';

@Module({
	controllers: [TicketController, AdminTicketController],
	providers: [TicketService, TicketRepository],
	imports: [TypeOrmModule.forFeature([Ticket]), ScheduleModule],
})
export class TicketModule {}
