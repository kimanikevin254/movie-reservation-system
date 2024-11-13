import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { PrismaService } from './services/prisma.service';

@Module({
	providers: [MailService, PrismaService],
	exports: [MailService, PrismaService],
})
export class CommonModule {}
