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

function ensureEnvVars(...keys: string[]): void {
	const missingKeys = keys.filter((key) => !process.env[key]);
	if (missingKeys.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missingKeys.join(', ')}`,
		);
	}
}

export default registerAs<Config>('config', () => {
	ensureEnvVars(
		'DB_TYPE',
		'DB_HOST',
		'DB_PORT',
		'DB_USERNAME',
		'DB_PASSWORD',
		'DB_DATABASE',
		'JWT_SECRET',
		'JWT_TTL_MINUTES',
		'REFRESH_TTL_MINUTES',
		'MAGIC_LINK_SECRET',
		'MAILGUN_DOMAIN',
		'MAILGUN_API_KEY',
		'MAIL_FROM_ADDRESS',
		'MAGIC_LINK_CALLBACK',
		'MAGIC_LINK_TTL_MINS',
		'APPLICATION_NAME',
	);

	return {
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
			jwtTtl: parseInt(process.env.JWT_TTL_MINUTES),
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
	};
});
