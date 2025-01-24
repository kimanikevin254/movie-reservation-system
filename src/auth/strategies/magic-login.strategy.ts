import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import MagicLoginStrategy from 'passport-magic-login';
import { AuthService } from '../auth.service';

@Injectable()
export class MagicLogin extends PassportStrategy(MagicLoginStrategy) {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
	) {
		super({
			secret: 'MySupersecre+!',
			callbackUrl: '/auth/magiclogin/callback',
			async sendMagicLink(destination, href) {
				// TODO: Send email to user
				console.log(
					`Hello ${destination}, click this link to finish logging in: https://yourcompany.com${href}`,
				);
			},
			verify: (payload, verifyCallback) => {
				return verifyCallback(null, this.validate(payload));
			},
			jwtOptions: {
				expiresIn: '5000',
			},
		});
	}

	validate(payload: { destination: string }): unknown {
		return this.authService.handleMagicLink(payload.destination);
	}
}
