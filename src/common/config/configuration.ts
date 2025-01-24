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
		magicLinkSecret: string;
	};
	mail: {
		mailgunDomain: string;
		mailgunApiKey: string;
		from: string;
		links: {
			magicLinkCallback: string;
		};
		linksTtl: {
			magicLink: number;
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
		magicLinkSecret: process.env.MAGIC_LINK_SECRET,
	},
	mail: {
		mailgunDomain: process.env.MAILGUN_DOMAIN,
		mailgunApiKey: process.env.MAILGUN_API_KEY,
		from: process.env.MAIL_FROM_ADDRESS,
		links: {
			magicLinkCallback: process.env.MAGIC_LINK_CALLBACK,
		},
		linksTtl: {
			magicLink: parseInt(process.env.MAGIC_LINK_TTL_MINS),
		},
	},
	appName: process.env.APPLICATION_NAME,
}));
