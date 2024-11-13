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
		this.MAILGUN_KEY = this.configService.get<string>(
			'config.mailgun.apiKey',
		);
		this.MAILGUN_DOMAIN = this.configService.get<string>(
			'config.mailgun.domain',
		);
		this.MAIL_FROM = this.configService.get<string>('config.mailFrom');
		this.APP_NAME = this.configService.get<string>('config.appName');

		// Initialize Mailgun client
		const mailgun = new Mailgun(FormData);
		this.mailgunClient = mailgun.client({
			username: 'api',
			key: this.MAILGUN_KEY,
		});
	}

	async sendPasswordResetMail(to: string, name: string, resetLink: string) {
		const htmlContent =
			await this.emailTemplateService.passwordResetTemplate(
				name.split(' ')[0],
				resetLink,
			);

		return await this.mailgunClient.messages.create(this.MAILGUN_DOMAIN, {
			from: this.MAIL_FROM,
			to,
			subject: 'Password Reset Request',
			html: htmlContent,
		});
	}

	async sendEmailVerification(
		to: string,
		name: string,
		verificationLink: string,
	) {
		const htmlContent =
			await this.emailTemplateService.verificationEmailTemplate(
				name.split(' ')[0],
				verificationLink,
			);

		return await this.mailgunClient.messages.create(this.MAILGUN_DOMAIN, {
			from: this.MAIL_FROM,
			to,
			subject: 'Email Verification',
			html: htmlContent,
		});
	}
}
