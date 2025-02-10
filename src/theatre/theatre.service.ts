import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { UserService } from 'src/user/user.service';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { Theatre } from './entities/theatre.entity';
import { TheatreRepository } from './repositories/theatre.repository';

@Injectable()
export class TheatreService extends BaseService<Theatre> {
	constructor(
		private readonly theatreRepository: TheatreRepository,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
	) {
		super(theatreRepository);
	}

	async create(userId: string, dto: CreateTheatreDto) {
		// Retrieve user
		const user = await this.userService.findById(userId);

		if (!user) {
			throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
		}

		const theatre = this.theatreRepository.create({ ...dto, user });
		const savedTheatre = await this.theatreRepository.save(theatre);

		return this.sanitize(savedTheatre, ['user', 'createdAt', 'updatedAt']);
	}

	async findOne(id: string) {
		const theatre = await this.findById(id);
		return this.sanitize(theatre, ['updatedAt']);
	}

	findUserTheatre(userId: string, theatreId: string) {
		return this.theatreRepository.findUserTheatre(userId, theatreId);
	}

	findUserTheatres(userId: string) {
		return this.theatreRepository.find({
			where: { user: { id: userId } },
		});
	}

	async update(userId: string, theatreId: string, dto: UpdateTheatreDto) {
		// Make sure user owns theatre
		const theatre = await this.theatreRepository.findUserTheatre(
			userId,
			theatreId,
		);

		if (!theatre) {
			throw new HttpException('Invalid theatre ID', HttpStatus.NOT_FOUND);
		}

		return this.theatreRepository.update({ id: theatre.id }, { ...dto });
	}

	async remove(userId: string, theatreId: string) {
		// Make sure user owns theatre
		const theatre = await this.theatreRepository.findUserTheatre(
			userId,
			theatreId,
		);

		if (!theatre) {
			throw new HttpException('Invalid theatre ID', HttpStatus.NOT_FOUND);
		}

		return this.theatreRepository.delete({ id: theatreId });
	}
}
