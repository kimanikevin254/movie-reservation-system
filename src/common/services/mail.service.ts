import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class MailService {
	private mailgunClient;

	private MAILGUN_KEY: string;
	private MAILGUN_DOMAIN: string;
	private MAIL_FROM: string;
	private APP_NAME: string;

	constructor(
		private configService: ConfigService,
		private emailTemplateService: EmailTemplateService,
	) {
		// Initialize environment variables in constructor
		this.MAILGUN_KEY = this.configService.getOrThrow<string>(
			'config.mail.mailgunApiKey',
		);
		this.MAILGUN_DOMAIN = this.configService.getOrThrow<string>(
			'config.mail.mailgunDomain',
		);
		this.MAIL_FROM =
			this.configService.getOrThrow<string>('config.mail.from');
		this.APP_NAME = this.configService.getOrThrow<string>('config.appName');

		// Initialize Mailgun client
		const mailgun = new Mailgun(FormData);
		this.mailgunClient = mailgun.client({
			username: 'api',
			key: this.MAILGUN_KEY,
		});
	}

	async sendMagicLink(data: { destination: string; href: string }) {
		const htmlContent = await this.emailTemplateService.sendMagicLink(
			data.href,
		);

		return await this.mailgunClient.messages.create(this.MAILGUN_DOMAIN, {
			from: this.MAIL_FROM,
			to: data.destination,
			subject: `Continue to ${this.APP_NAME}`,
			html: htmlContent,
		});
	}
}
