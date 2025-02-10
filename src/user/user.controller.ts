import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	@ApiOperation({
		summary: 'User profile details',
	})
	profile(@User() user: IUser) {
		return this.userService.profile(user.id);
	}

	@Get('me/theatres')
	@ApiOperation({
		summary: 'Retrieves theatres owned by the user',
	})
	userTheatres(@User() user: IUser) {
		return this.userService.findUserTheatres(user.id);
	}

	@Get('me/shows')
	@ApiOperation({
		summary: 'Get shows created by the user',
	})
	userShows() {}
}
