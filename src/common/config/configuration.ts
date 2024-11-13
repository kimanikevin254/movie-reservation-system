import { registerAs } from '@nestjs/config';

interface Config {
	database: {
		uri: string;
	};
	jwtSecret: string;
	mailgun: {
		domain: string;
		apiKey: string;
	};
	mailFrom: string;
	appName: string;
	frontendEmailVerificationLink: string;
	emailVerificationLinkTtlMins: string;
}

export default registerAs<Config>('config', () => ({
	database: {
		uri: process.env.DATABASE_URL,
	},
	jwtSecret: process.env.JWT_ACCESS_SECRET,
	mailgun: {
		domain: process.env.MAILGUN_DOMAIN,
		apiKey: process.env.MAILGUN_API_KEY,
	},
	mailFrom: process.env.MAIL_FROM_ADDRESS,
	appName: process.env.APPLICATION_NAME,
	frontendEmailVerificationLink:
		process.env.FRONTEND_APPLICATION_EMAIL_VERIFICATION_LINK,
	emailVerificationLinkTtlMins:
		process.env.EMAIL_VERIFICATION_LINK_TTL_MINUTES,
}));
