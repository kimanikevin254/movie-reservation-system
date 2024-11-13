import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokensDto {
	@ApiProperty({
		description: 'The ID of the user requesting new tokens.',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsString({ message: 'The user ID must be a string.' })
	@IsNotEmpty({ message: 'The user ID should not be empty.' })
	userId: string;

	@ApiProperty({
		description:
			'The refresh token to be used for obtaining new access tokens.',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	@IsString({ message: 'The refresh token must be a string.' })
	@IsNotEmpty({ message: 'The refresh token should not be empty.' })
	refreshToken: string;
}
