import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
@ApiTags('auth')
@UseGuards(ThrottlerGuard)
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

	@Get('verify-email')
	@ApiOperation({
		summary: 'Verify email',
		description: 'Verifies user email and return auth tokens.',
	})
	verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
		return this.authService.verifyEmail(verifyEmailDto.token);
	}

	// @Post('login')
	// @ApiOperation({
	// 	summary: 'User Login',
	// 	description:
	// 		'Logs in a user with an email and password, returning a token.',
	// })
	// login(@Body() logInDto: LogInDto) {
	// 	return this.authService.login(logInDto);
	// }

	// @Post('refresh-token')
	// @ApiOperation({
	// 	summary: 'Refresh Tokens',
	// 	description:
	// 		'Refreshes access and refresh tokens for authenticated users.',
	// })
	// refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
	// 	return this.authService.refreshTokens(refreshTokensDto);
	// }

	// @Post('logout')
	// @ApiOperation({
	// 	summary: 'User Logout',
	// 	description: 'Logs out a user by invalidating the refresh token.',
	// })
	// @ApiBearerAuth()
	// @UseGuards(AuthGuard)
	// logout(@Body() logOutDto: LogOutDto) {
	// 	return this.authService.logOut(logOutDto);
	// }

	// @Post('change-password')
	// @ApiOperation({
	// 	summary: 'Change Password',
	// 	description: 'Allows an authenticated user to change their password.',
	// })
	// @ApiBearerAuth()
	// @UseGuards(AuthGuard)
	// changePassword(
	// 	@Body() changePasswordDto: ChangePasswordDto,
	// 	@User() user: IUser,
	// ) {
	// 	return this.authService.changePassword(changePasswordDto, user.id);
	// }

	// @Post('forget-password')
	// @ApiOperation({
	// 	summary: 'Forget Password',
	// 	description:
	// 		'Initiates the password reset process by sending a reset token.',
	// })
	// forgetPasswordPassword(
	// 	@Body() forgetPasswordPasswordDto: ForgetPasswordDto,
	// ) {
	// 	return this.authService.forgetPassword(forgetPasswordPasswordDto);
	// }

	// @Post('reset-password')
	// @ApiOperation({
	// 	summary: 'Reset Password',
	// 	description:
	// 		"Resets the user's password using a token sent to their email.",
	// })
	// resetPasswordPassword(@Body() resetPasswordPasswordDto: ResetPasswordDto) {
	// 	return this.authService.resetPassword(resetPasswordPasswordDto);
	// }
}
