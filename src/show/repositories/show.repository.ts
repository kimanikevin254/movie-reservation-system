import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from '../entities/show.entity';

@Injectable()
export class ShowRepository extends Repository<Show> {
	constructor(
		@InjectRepository(Show)
		private readonly showRepository: Repository<Show>,
	) {
		super(
			showRepository.target,
			showRepository.manager,
			showRepository.queryRunner,
		);
	}

	findUserShows(userId: string) {
		return this.showRepository.find({
			where: { user: { id: userId } },
			relations: ['user'],
		});
	}

	findTheatreShows(theatreId: string) {
		return this.showRepository.find({
			where: { theatres: { id: theatreId } },
			relations: ['theatre'],
		});
	}

	findOwnedShow(userId: string, showId: string) {
		return this.showRepository.findOne({
			where: { id: showId, user: { id: userId } },
			loadRelationIds: true,
		});
	}
}
