import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import { MailService } from 'src/common/services/mail.service';
import { AuthService } from '../auth.service';

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,
		private readonly mailService: MailService,
		private configService: ConfigService,
	) {
		super({
			secret: configService.getOrThrow('config.auth.magicLinkSecret'),
			callbackUrl: configService.getOrThrow(
				'config.mail.links.magicLinkCallback',
			),
			sendMagicLink: async (destination, href) => {
				return this.mailService.sendMagicLink(destination, href);
			},
			verify: (payload, verifyCallback) => {
				return verifyCallback(null, this.validate(payload.destination));
			},
			jwtOptions: {
				expiresIn: `${configService.getOrThrow(
					'config.mail.linksTtl.magicLink',
				)}m`,
			},
		});
	}

	validate(destination: string): unknown {
		return this.authService.handleMagicLink(destination);
	}
}
