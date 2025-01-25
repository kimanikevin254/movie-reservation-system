import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TheatreService } from 'src/theatre/theatre.service';
import { Repository } from 'typeorm';
import { CreateAuditoriumDto, RowDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { Auditorium } from './entities/auditorium.entity';

@Injectable()
export class AuditoriumService {
	constructor(
		@InjectRepository(Auditorium)
		private readonly auditoriumRepository: Repository<Auditorium>,
		private readonly theatreService: TheatreService,
	) {}

	private sanitize<T>(obj: T, excludedFields: (keyof T)[]): Partial<T> {
		const sanitizedObj = { ...obj };
		excludedFields.forEach((field) => delete sanitizedObj[field]);
		return sanitizedObj;
	}

	private mapSeatMap(seatMap: RowDto[]) {
		return {
			rows: seatMap.map((row) => ({
				row: row.row,
				seats: row.seats.map((seat) => ({
					column: seat.column,
					seatNumber: seat.seatNumber,
				})),
			})),
		};
	}

	async create(userId: string, theatreId: string, dto: CreateAuditoriumDto) {
		const theatre = await this.theatreService.findUserTheatre(
			userId,
			theatreId,
		);

		if (!theatre) {
			throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
		}

		// Map DTO to entity format
		const seatMap = this.mapSeatMap(dto.seatMap);

		// Save auditorium
		const auditorium = this.auditoriumRepository.create({
			...dto,
			seatMap,
			theatre,
		});
		const savedAuditorium =
			await this.auditoriumRepository.save(auditorium);

		return this.sanitize(savedAuditorium, [
			'createdAt',
			'updatedAt',
			'seatMap',
			'theatre',
		]);
	}

	async findTheatreAuditoriums(theatreId: string) {
		const theatre = await this.theatreService.findOne(theatreId);
		return this.auditoriumRepository.find({
			where: { theatre: { id: theatre.id } },
		});
	}

	findOne(id: string) {
		return this.auditoriumRepository.findOne({ where: { id } });
	}

	async update(
		userId: string,
		auditoriumId: string,
		dto: UpdateAuditoriumDto,
	) {
		const auditorium = await this.findUserAuditorium(userId, auditoriumId);

		if (!auditorium) {
			throw new HttpException(
				'Invalid auditorium ID',
				HttpStatus.NOT_FOUND,
			);
		}

		await this.auditoriumRepository.update(
			{ id: auditoriumId },
			{ ...dto, seatMap: dto.seatMap && this.mapSeatMap(dto.seatMap) },
		);

		return { message: 'Auditorium updated successfully' };
	}

	async remove(userId: string, auditoriumId: string) {
		const auditorium = await this.findUserAuditorium(userId, auditoriumId);

		if (!auditorium) {
			throw new HttpException(
				'Invalid auditorium ID',
				HttpStatus.NOT_FOUND,
			);
		}

		await this.auditoriumRepository.delete(auditorium.id);

		return { message: 'Deleted successfully' };
	}

	async findUserAuditorium(userId: string, auditoriumId: string) {
		return this.auditoriumRepository.findOne({
			where: { id: auditoriumId, theatre: { user: { id: userId } } },
		});
	}
}
