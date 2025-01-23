import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository extends Repository<PasswordResetToken> {
	constructor(private dataSource: DataSource) {
		super(PasswordResetToken, dataSource.createEntityManager());
	}

	async findValidToken(
		token: string,
	): Promise<PasswordResetToken | undefined> {
		return this.createQueryBuilder('token')
			.leftJoin('token.user', 'user')
			.addSelect(['user.id'])
			.where('token.token = :token', { token })
			.andWhere('token.expiresAt > :now', { now: new Date() })
			.getOne();
	}
}
