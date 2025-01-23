import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { EmailTemplateService } from './services/email-template.service';
import { MailService } from './services/mail.service';

@Global()
@Module({
	imports: [DatabaseModule],
	providers: [MailService, EmailTemplateService],
	exports: [MailService],
})
export class CommonModule {}
