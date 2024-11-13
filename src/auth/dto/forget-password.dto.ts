import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgetPasswordDto {
	@ApiProperty({
		description:
			'The email address associated with the user account for which the password is being reset.',
		example: 'user@example.com',
	})
	@IsEmail(
		{},
		{ message: 'The provided email must be a valid email address.' },
	)
	email: string;
}
