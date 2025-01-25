import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { TheatreRepository } from './repositories/theatre.repository';

@Injectable()
export class TheatreService {
	constructor(
		private readonly theatreRepository: TheatreRepository,
		private readonly userService: UserService,
	) {}

	private sanitize<T>(obj: T, excludedFields: (keyof T)[]): Partial<T> {
		const sanitizedObj = { ...obj };
		excludedFields.forEach((field) => delete sanitizedObj[field]);
		return sanitizedObj;
	}

	async create(userId: string, dto: CreateTheatreDto) {
		// Retrieve user
		const user = await this.userService.findOneBy('id', userId);

		if (!user) {
			throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
		}

		const theatre = this.theatreRepository.create({ ...dto, user });
		const savedTheatre = await this.theatreRepository.save(theatre);

		return this.sanitize(savedTheatre, ['user', 'createdAt', 'updatedAt']);
	}

	async findAll() {
		const theatres = await this.theatreRepository.find();
		return theatres.map((theatre) =>
			this.sanitize(theatre, ['user', 'updatedAt']),
		);
	}

	findOne(id: string) {
		return this.theatreRepository.findOne({ where: { id } });
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
