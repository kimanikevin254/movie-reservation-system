import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LogInDto } from './dto/login.dto';
import { LogOutDto } from './dto/logOut.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignUpDto } from './dto/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	@ApiOperation({
		summary: 'User Signup',
		description: 'Registers a new user with a name, email, and password.',
	})
	signup(@Body() signUpDto: SignUpDto) {
		return this.authService.signup(signUpDto);
	}

	@Post('login')
	@ApiOperation({
		summary: 'User Login',
		description:
			'Logs in a user with an email and password, returning a token.',
	})
	login(@Body() logInDto: LogInDto) {
		return this.authService.login(logInDto);
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
	logout(@Body() logOutDto: LogOutDto) {
		return this.authService.logOut(logOutDto);
	}

	@Post('change-password')
	@ApiOperation({
		summary: 'Change Password',
		description: 'Allows an authenticated user to change their password.',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	changePassword(
		@Body() changePasswordDto: ChangePasswordDto,
		@User() user: IUser,
	) {
		return this.authService.changePassword(changePasswordDto, user.id);
	}

	@Post('forget-password')
	@ApiOperation({
		summary: 'Forget Password',
		description:
			'Initiates the password reset process by sending a reset token.',
	})
	forgetPasswordPassword(
		@Body() forgetPasswordPasswordDto: ForgetPasswordDto,
	) {
		return this.authService.forgetPassword(forgetPasswordPasswordDto);
	}

	@Post('reset-password')
	@ApiOperation({
		summary: 'Reset Password',
		description:
			"Resets the user's password using a token sent to their email.",
	})
	resetPasswordPassword(@Body() resetPasswordPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(resetPasswordPasswordDto);
	}
}
