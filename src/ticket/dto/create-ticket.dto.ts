import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
	@ApiProperty({
		description: 'The name of the ticket',
		example: 'VIP',
	})
	name: string;

	@ApiProperty({
		description: 'The description of the ticket',
		example: 'VIP ticket',
	})
	description: string;

	@ApiProperty({
		description: 'The price of the ticket',
		example: 100,
	})
	price: number;

	@ApiProperty({
		description: 'The quantity of the ticket',
		example: 100,
	})
	quantity: number;
}
