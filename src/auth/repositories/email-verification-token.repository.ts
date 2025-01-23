import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';

@Injectable()
export class EmailVerificationTokenRepository extends Repository<EmailVerificationToken> {
	constructor(private dataSource: DataSource) {
		super(EmailVerificationToken, dataSource.createEntityManager());
	}

	async findValidToken(
		token: string,
	): Promise<EmailVerificationToken | undefined> {
		return this.createQueryBuilder('token')
			.leftJoin('token.user', 'user')
			.addSelect(['user.id'])
			.where('token.token = :token', { token })
			.andWhere('token.expiresAt > :now', { now: new Date() })
			.getOne();
	}
}
