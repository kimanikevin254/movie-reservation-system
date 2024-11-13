import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogOutDto {
	@ApiProperty({
		description:
			'The refresh token that will be invalidated upon logging out.',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	@IsString({ message: 'The refresh token must be a string.' })
	refreshToken: string;
}
