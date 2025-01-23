import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
	constructor(private dataSource: DataSource) {
		super(RefreshToken, dataSource.createEntityManager());
	}

	async findValidToken(
		token: string,
		userId: string,
	): Promise<RefreshToken | undefined> {
		return this.createQueryBuilder('token')
			.leftJoin('token.user', 'user')
			.addSelect(['user.id'])
			.where('token.token = :token', { token })
			.andWhere('token.expiresAt > :now', { now: new Date() })
			.andWhere('user.id = :userId', { userId })
			.getOne();
	}
}
