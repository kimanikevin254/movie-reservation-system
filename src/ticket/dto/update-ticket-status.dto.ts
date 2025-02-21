import { ApiProperty } from '@nestjs/swagger';
import { TicketStatusEnum } from '../entities/ticket.entity';

export class UpdateTicketStatusDto {
	@ApiProperty({
		description: 'The status of the ticket',
		example: TicketStatusEnum.ACTIVE,
	})
	status: TicketStatusEnum;
}
