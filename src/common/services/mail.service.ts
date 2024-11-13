import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailService {
	private mailgunClient;

	private MAILGUN_KEY: string;
	private MAILGUN_DOMAIN: string;
	private MAIL_FROM: string;
	private APP_NAME: string;

	constructor(private configService: ConfigService) {
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
		try {
			const htmlContent = `
				<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
					<h2 style="color: #4CAF50;">Password Reset Request</h2>
					<p>Hello ${name.split(' ')[0]},</p>
					<p>We received a request to reset your password. If you did not make this request, you can ignore this email.</p>
					<p>To reset your password, click the link below:</p>
					<a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
					<p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
					<p>${resetLink}</p>
					<p>Thank you,<br>${this.APP_NAME} Team</p>
					<hr />
					<p style="font-size: 12px; color: #999;">If you did not request a password reset, please disregard this email.</p>
				</div>
				`;

			return await this.mailgunClient.messages.create(
				this.MAILGUN_DOMAIN,
				{
					from: this.MAIL_FROM,
					to,
					subject: 'Password Reset Request',
					html: htmlContent,
				},
			);
		} catch (error) {
			throw error;
		}
	}
}
