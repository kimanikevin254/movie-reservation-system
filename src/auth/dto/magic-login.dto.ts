import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class MagicLoginDto {
	@ApiProperty({
		description: 'The email of the user',
		example: 'user@email.com',
	})
	@IsString({ message: 'Destination(email address) must be provided.' })
	@IsEmail()
	destination: string;
}
