import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTheatreDto {
	@ApiProperty({
		description: 'The name of the theatre',
		example: 'My Theatre',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'The location of the theatre',
		example: 'Garden City Mall, Nairobi, Kenya',
	})
	@IsString()
	@IsNotEmpty()
	location: string;
}
