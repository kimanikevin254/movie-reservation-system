import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
	constructor(private userRepository: UserRepository) {}

	async findOneBy(
		criteria: 'id' | 'email',
		value: string,
	): Promise<User | undefined> {
		if (criteria === 'id') {
			return this.userRepository.findById(value);
		} else if (criteria === 'email') {
			return this.userRepository.findByEmail(value);
		} else return undefined;
	}

	async profile(userId: string) {
		return this.userRepository.findById(userId);
	}

	async create(data: Partial<User>) {
		const newUser = this.userRepository.create({
			name: data.name,
		});

		return this.userRepository.save(newUser);
	}

	async updateUser(userId: string, data: Partial<User>) {
		// Check if user exists
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new HttpException(
				'User with the provided ID does not exist',
				HttpStatus.BAD_REQUEST,
			);
		}

		return this.userRepository.update({ id: userId }, data);
	}
}
