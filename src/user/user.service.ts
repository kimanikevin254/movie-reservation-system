import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ShowService } from 'src/show/show.service';
import { TheatreService } from 'src/theatre/theatre.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(forwardRef(() => TheatreService))
		private readonly theatreService: TheatreService,
		@Inject(forwardRef(() => ShowService))
		private readonly showService: ShowService,
	) {
		super(userRepository);
	}

	async findByEmail(email: string) {
		return this.userRepository.findOne({ where: { email } });
	}

	async profile(userId: string) {
		const user = await this.findById(userId);
		return this.sanitize(user, ['updatedAt']);
	}

	async create(data: Partial<User>) {
		const newUser = this.userRepository.create({
			email: data.email,
		});

		return this.userRepository.save(newUser);
	}

	async updateUser(userId: string, data: Partial<User>) {
		// Check if user exists
		const user = await this.findById(userId);

		if (!user) {
			throw new HttpException(
				'User with the provided ID does not exist',
				HttpStatus.BAD_REQUEST,
			);
		}

		return this.userRepository.update({ id: userId }, data);
	}

	async findUserTheatres(userId: string) {
		return this.theatreService.findUserTheatres(userId);
	}

	async findUserShows(userId: string) {
		return this.showService.findUserShows(userId);
	}
}
