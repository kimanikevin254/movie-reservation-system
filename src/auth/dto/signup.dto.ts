import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
	@ApiProperty({
		description: 'The name of the user signing up',
		example: 'Jane Doe',
	})
	@IsString()
	@IsNotEmpty({ message: 'Name should not be empty.' })
	name: string;

	@ApiProperty({
		description:
			'The email address of the user. It must be a valid email format.',
		example: 'janedoe@example.com',
	})
	@IsEmail({}, { message: 'Invalid email address.' })
	@IsNotEmpty({ message: 'Email should not be empty.' })
	email: string;

	@ApiProperty({
		description:
			'The password for the user account. Must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
		example: 'P@ssw0rd1',
	})
	@IsString()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		{
			message:
				'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
		},
	)
	password: string;
}
