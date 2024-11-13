import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@ApiOperation({
		summary: 'User profile',
		description: 'Gets the current users details',
	})
	profile(@User() user: IUser) {
		return this.userService.profile(user.id);
	}
}
