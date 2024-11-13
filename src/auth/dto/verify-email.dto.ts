import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
	@ApiProperty({
		description: 'The email verification token sent to user email address.',
		example: 'd4fgh7sdf3e5rtg6th',
	})
	@IsString()
	@IsNotEmpty({ message: 'Token is required' })
	token: string;
}
