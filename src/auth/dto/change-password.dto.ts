import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
	@ApiProperty({
		description: 'The current password of the user that is being changed.',
		example: 'CurrentP@ssword1',
	})
	@IsString({ message: 'Old password must be a string.' })
	oldPassword: string;

	@ApiProperty({
		description:
			'The new password for the user. Must meet password complexity requirements.',
		example: 'N3wP@ssword2',
	})
	@IsString({ message: 'New password must be a string.' })
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
		{
			message:
				'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character(@$!%*?&.)',
		},
	)
	newPassword: string;
}
