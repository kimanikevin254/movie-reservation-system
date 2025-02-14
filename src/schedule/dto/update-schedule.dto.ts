import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined } from 'class-validator';

export class UpdateScheduleDto {
	@ApiProperty({
		description: 'Time the schedule starts',
		example: '2025-02-10T14:00:00.000Z',
	})
	@IsDateString()
	@IsDefined()
	startTime: Date;
}
