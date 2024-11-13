import { Module } from '@nestjs/common';
import { EmailTemplateService } from './services/email-template.service';
import { MailService } from './services/mail.service';
import { PrismaService } from './services/prisma.service';

@Module({
	providers: [MailService, PrismaService, EmailTemplateService],
	exports: [MailService, PrismaService],
})
export class CommonModule {}
