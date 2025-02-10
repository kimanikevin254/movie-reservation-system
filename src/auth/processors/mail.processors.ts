import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from 'src/common/services/mail.service';

@Processor('auth-mail')
export class MailProcessor extends WorkerHost {
	constructor(private readonly mailService: MailService) {
		super();
	}
	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'send-mail':
				return this.mailService.sendMagicLink(job.data);
		}
	}

	@OnWorkerEvent('completed')
	onCompleted(job: Job) {
		console.log(job.id);
	}
}
