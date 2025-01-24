import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CompleteSignUpDto {
	@ApiProperty({
		description:
			'The email address of the user. It must be a valid email format.',
		example: 'janedoe@example.com',
	})
	@IsEmail({}, { message: 'Invalid email address.' })
	@IsNotEmpty({ message: 'Email should not be empty.' })
	email: string;

	@ApiProperty({
		description: 'The name of the user signing up',
		example: 'Jane Doe',
	})
	@IsString()
	@IsNotEmpty({ message: 'Name should not be empty.' })
	name: string;
}
