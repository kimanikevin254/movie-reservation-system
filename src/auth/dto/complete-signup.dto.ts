import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompleteSignUpDto {
	@ApiProperty({
		description: 'The ID of the user completing the signup process.',
		example: 'janedoe@example.com',
	})
	@IsNotEmpty({ message: 'userId should not be empty.' })
	@IsUUID()
	userId: string;

	@ApiProperty({
		description: 'The name of the user signing up',
		example: 'Jane Doe',
	})
	@IsString()
	@IsNotEmpty({ message: 'Name should not be empty.' })
	name: string;
}
