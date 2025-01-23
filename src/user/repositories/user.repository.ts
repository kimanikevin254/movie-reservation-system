import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
	constructor(private dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	}

	async findByEmail(email: string): Promise<User | undefined> {
		return this.findOne({ where: { email } });
	}

	async findById(id: string): Promise<User | undefined> {
		return this.findOne({ where: { id } });
	}
}
