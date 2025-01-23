import { registerAs } from '@nestjs/config';
import { DatabaseType } from 'typeorm';

interface Config {
	db: {
		type: DatabaseType;
		host: string;
		port: number;
		username: string;
		password: string;
		database: string;
	};
	auth: {
		jwtSecret: string;
		jwtTtl: number;
		refreshTtl: number;
	};
	mail: {
		mailgunDomain: string;
		mailgunApiKey: string;
		from: string;
		links: {
			emailVerification: string;
			passwordReset: string;
		};
		linksTtl: {
			verification: number;
			passwordReset: number;
		};
	};
	appName: string;
}

export default registerAs<Config>('config', () => ({
	db: {
		type: process.env.DB_TYPE as DatabaseType,
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT),
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	},
	auth: {
		jwtSecret: process.env.JWT_SECRET,
		jwtTtl: parseInt(process.env.Jwt_TTL_MINUTES),
		refreshTtl: parseInt(process.env.REFRESH_TTL_MINUTES),
	},
	mail: {
		mailgunDomain: process.env.MAILGUN_DOMAIN,
		mailgunApiKey: process.env.MAILGUN_API_KEY,
		from: process.env.MAIL_FROM_ADDRESS,
		links: {
			emailVerification: process.env.EMAIL_VERIFICATION_LINK,
			passwordReset: process.env.PASSWORD_RESET_LINK,
		},
		linksTtl: {
			verification: parseInt(
				process.env.EMAIL_VERIFICATION_LINK_TTL_MINUTES,
			),
			passwordReset: parseInt(
				process.env.PASSWORD_RESET_LINK_TTL_MINUTES,
			),
		},
	},
	appName: process.env.APPLICATION_NAME,
}));
