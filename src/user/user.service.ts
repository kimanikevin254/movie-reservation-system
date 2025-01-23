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
		const user = await this.userRepository.findById(userId);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...rest } = user;

		return rest;
	}

	async create(data: Partial<User>) {
		// Check if user exists
		const user = await this.userRepository.findByEmail(data.email);

		if (user) {
			throw new HttpException(
				'This email address is already registered',
				HttpStatus.BAD_REQUEST,
			);
		}

		const newUser = this.userRepository.create({
			name: data.name,
			email: data.email,
			passwordHash: data.passwordHash,
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
