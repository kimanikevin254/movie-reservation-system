import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsString,
	Max,
	Min,
} from 'class-validator';

export class CreateShowDto {
	@ApiProperty({
		description: 'Name of the show',
		example: 'Mission Impossible',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'The release date of the show',
		example: '2025-07-16T00:00:00.000Z',
	})
	@IsDateString()
	@IsNotEmpty()
	releaseDate: Date;

	@ApiProperty({
		description: 'Duration of the show in minutes',
		example: 120,
	})
	@IsInt()
	@Min(1)
	@Max(600) // 10hrs
	duration: number;

	@ApiProperty({
		description: 'A brief description the of the show',
		example: 'Tom Cruise it tasked with a mission to...',
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({
		description: 'The rating of the show. A number between 1 and 10',
		example: 9,
	})
	@IsInt()
	@Min(1)
	@Max(10)
	rating: number;
}
