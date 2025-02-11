import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MagicLoginDto {
	@ApiProperty({
		description: 'The email of the user',
		example: 'user@email.com',
	})
	@IsString({ message: 'The refresh token must be a string.' })
	destination: string;
}
