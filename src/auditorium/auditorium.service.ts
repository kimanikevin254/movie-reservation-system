import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { TheatreService } from 'src/theatre/theatre.service';
import { CreateAuditoriumDto, RowDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { Auditorium } from './entities/auditorium.entity';
import { AuditoriumRepository } from './repositories/auditorium.repository';

@Injectable()
export class AuditoriumService extends BaseService<Auditorium> {
	constructor(
		private readonly auditoriumRepository: AuditoriumRepository,
		private readonly theatreService: TheatreService,
		@Inject(forwardRef(() => ScheduleService))
		private readonly scheduleService: ScheduleService,
	) {
		super(auditoriumRepository);
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

	async findOne(id: string) {
		const auditorium = await this.findById(id);

		if (!auditorium) {
			throw new HttpException(
				'Invalid auditorium ID',
				HttpStatus.NOT_FOUND,
			);
		}

		return this.sanitize(auditorium, ['updatedAt']);
	}

	async create(userId: string, theatreId: string, dto: CreateAuditoriumDto) {
		const theatre = await this.theatreService.findUserTheatre(
			userId,
			theatreId,
		);

		if (!theatre) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
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
		const theatre = await this.theatreService.findById(theatreId);

		if (!theatre) {
			throw new HttpException('Invalid theatre ID', HttpStatus.NOT_FOUND);
		}

		return this.auditoriumRepository.findTheatreAuditoriums(theatreId);
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
		return this.auditoriumRepository.findUserAuditorium(
			userId,
			auditoriumId,
		);
	}

	async auditoriumSchedules(theatreId: string, auditoriumId: string) {
		return this.scheduleService.findAuditoriumSchedules(
			theatreId,
			auditoriumId,
		);
	}
}
