import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({
		description: 'The token received for resetting the password.',
		example: 'abc123resetToken',
	})
	@IsString({ message: 'The token must be a string.' })
	token: string;

	@ApiProperty({
		description:
			'The new password, which must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
		example: 'NewSecurePassword1!',
	})
	@IsString({ message: 'The password must be a string.' })
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
		{
			message:
				'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character(@$!%*?&.)',
		},
	)
	password: string;
}
