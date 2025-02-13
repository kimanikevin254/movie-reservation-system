import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { AuthService } from './auth.service';
import { CompleteSignUpDto } from './dto/complete-signup.dto';
import { LogOutDto } from './dto/logOut.dto';
import { MagicLoginDto } from './dto/magic-login.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { AuthGuard } from './guards/auth.guard';
import { MagicLoginStrategy } from './strategies/magic-login.strategy';

@Controller('auth')
@ApiTags('auth')
// @UseGuards(ThrottlerGuard)
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly magicLoginStrategy: MagicLoginStrategy,
	) {}

	@Post('/magic-login')
	@ApiOperation({
		summary: 'Magic Link Login',
		description:
			"Initiates the magic link login process, sending a magic login link to the user's email address.",
	})
	magicLinkLogin(
		@Req() req: Request,
		@Res() res: Response,
		@Body() _dto: MagicLoginDto,
	) {
		return this.magicLoginStrategy.send(req, res);
	}

	@Get('/magic-login/callback')
	@UseGuards(PassportAuthGuard('magiclogin'))
	@ApiOperation({
		summary: 'Magic Link Login Callback',
		description:
			'Handles the callback from the magic link login, allowing the user to log in or complete the signup process.',
	})
	magicLinkLoginCallback(@Query('token') token: string, @User() user: IUser) {
		return this.authService.loginOrCompleteSignup(user);
	}

	@Post('complete-signup')
	@ApiOperation({
		summary: 'Complete Signup',
		description: 'Completes the signup process by updating the name, etc.',
	})
	completeSignup(@Body() dto: CompleteSignUpDto) {
		return this.authService.signup(dto);
	}

	@Post('refresh-token')
	@ApiOperation({
		summary: 'Refresh Tokens',
		description:
			'Refreshes access and refresh tokens for authenticated users.',
	})
	refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
		return this.authService.refreshTokens(refreshTokensDto);
	}

	@Post('logout')
	@ApiOperation({
		summary: 'User Logout',
		description: 'Logs out a user by invalidating the refresh token.',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	logout(@User() user: IUser, @Body() dto: LogOutDto) {
		return this.authService.logOut(user.id, dto);
	}
}
