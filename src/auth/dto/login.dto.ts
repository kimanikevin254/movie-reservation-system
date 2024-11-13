import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LogInDto {
	@ApiProperty({
		description:
			'The email address of the user trying to log in. Must be in a valid email format.',
		example: 'user@example.com',
	})
	@IsEmail({}, { message: 'Please provide a valid email address.' })
	email: string;

	@ApiProperty({
		description: 'The password for the user account.',
		example: 'P@ssw0rd1',
	})
	@IsString({ message: 'Password must be a string.' })
	password: string;
}
