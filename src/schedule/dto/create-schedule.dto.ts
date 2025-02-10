import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateScheduleDto {
	@ApiProperty({
		description: 'The ID of the auditorium to create a schedule for',
		example: 'e1f63769-4835-4d09-85b2-870a5df5b034',
	})
	@IsUUID()
	@IsNotEmpty()
	@IsDefined()
	auditoriumId: string;

	@ApiProperty({
		description: 'The ID of the show to create a schedule for',
		example: 'e1f63769-4835-4d09-85b2-870a5df5b034',
	})
	@IsUUID()
	@IsNotEmpty()
	@IsDefined()
	showId: string;

	@ApiProperty({
		description: 'Time the schedule starts',
		example: '2025-02-10T14:00:00.000Z',
	})
	@IsDateString()
	@IsDefined()
	startTime: Date;
}
