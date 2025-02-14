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
import { UserService } from 'src/user/user.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Show } from './entities/show.entity';
import { ShowRepository } from './repositories/show.repository';

@Injectable()
export class ShowService extends BaseService<Show> {
	constructor(
		private readonly showRepository: ShowRepository,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => TheatreService))
		private readonly theatreService: TheatreService,
		@Inject(forwardRef(() => ScheduleService))
		private readonly scheduleService: ScheduleService,
	) {
		super(showRepository);
	}

	async create(userId: string, dto: CreateShowDto) {
		const user = await this.userService.findById(userId);

		const show = this.showRepository.create({
			...dto,
			user,
		});

		const savedShow = await this.showRepository.save(show);

		return this.sanitize(savedShow, [
			'user',
			'theatres',
			'updatedAt',
			'createdAt',
		]);
	}

	async findUserShows(userId: string) {
		return this.showRepository.findUserShows(userId);
	}

	async findTheatreShows(theatreId: string) {
		const theatre = await this.theatreService.findById(theatreId);

		if (!theatre) {
			throw new HttpException('Invalid theatre ID', HttpStatus.NOT_FOUND);
		}

		return this.showRepository.findTheatreShows(theatre.id);
	}

	async findOne(id: string) {
		const show = await this.findById(id);
		return this.sanitize(show, ['updatedAt']);
	}

	async update(userId: string, showId: string, dto: UpdateShowDto) {
		const show = await this.showRepository.findOwnedShow(userId, showId);

		if (!show) {
			throw new HttpException('Invalid show ID', HttpStatus.NOT_FOUND);
		}

		await this.showRepository.update({ id: show.id }, { ...dto });

		return;
	}

	async remove(userId: string, showId: string) {
		const show = await this.showRepository.findOwnedShow(userId, showId);

		if (!show) {
			throw new HttpException('Invalid show ID', HttpStatus.NOT_FOUND);
		}

		await this.showRepository.remove(show);

		return;
	}

	findShowSchedules(showId: string) {
		return this.scheduleService.findShowSchedules(showId);
	}
}
