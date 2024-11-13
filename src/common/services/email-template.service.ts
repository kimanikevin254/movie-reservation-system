import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailTemplateService {
	private APP_NAME: string;
	private EMAIL_VERIFICATION_LINK_TTL: string;
	private PASSWORD_RESET_LINK_TTL: string;

	constructor(private configService: ConfigService) {
		this.APP_NAME = this.configService.get<string>('config.appName');
		this.EMAIL_VERIFICATION_LINK_TTL = this.configService.get<string>(
			'config.emailVerificationLinkTtlMins',
		);
		this.PASSWORD_RESET_LINK_TTL = this.configService.get<string>(
			'config.passwordResetLinkTtlMins',
		);
	}

	// In prod, you need to change process.cwd() to __dirname and remove the second argument
	private filePath(fileName: string) {
		return path.join(process.cwd(), 'src/common/templates/email', fileName);
	}

	async verificationEmailTemplate(name: string, verificationLink: string) {
		// Read the EJS file content
		const templateContent = fs.readFileSync(
			this.filePath('verification-email.ejs'),
			'utf8',
		);

		// Render the template with dynamic values
		return ejs.render(templateContent, {
			name,
			verificationLink,
			appName: this.APP_NAME,
			linkTtl: this.EMAIL_VERIFICATION_LINK_TTL,
		});
	}

	async passwordResetTemplate(name: string, resetLink: string) {
		// Read the EJS file content
		const templateContent = fs.readFileSync(
			this.filePath('password-reset-email.ejs'),
			'utf8',
		);

		// Render the template with dynamic values
		return ejs.render(templateContent, {
			name,
			resetLink,
			appName: this.APP_NAME,
			linkTtl: this.PASSWORD_RESET_LINK_TTL,
		});
	}
}
