import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailTemplateService {
	constructor(private configService: ConfigService) {}

	// In prod, you need to change process.cwd() to __dirname and remove the second argument
	private filePath(fileName: string) {
		return path.join(process.cwd(), 'src/common/templates/email', fileName);
	}

	async sendMagicLink(magicLink: string) {
		// Read the EJS file content
		const templateContent = fs.readFileSync(
			this.filePath('magic-link.template.ejs'),
			'utf8',
		);

		// Render the template with dynamic values
		return ejs.render(templateContent, {
			magicLink,
			linkTtl: this.configService.getOrThrow(
				'config.mail.linksTtl.magicLink',
			),
			appName: this.configService.getOrThrow('config.appName'),
		});
	}
}
