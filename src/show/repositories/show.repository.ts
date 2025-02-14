import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Show } from '../entities/show.entity';

@Injectable()
export class ShowRepository extends Repository<Show> {
	constructor(@InjectDataSource() dataSource: DataSource) {
		super(Show, dataSource.createEntityManager());
	}

	findUserShows(userId: string) {
		return this.find({
			where: { user: { id: userId } },
			relations: ['user'],
		});
	}

	findTheatreShows(theatreId: string) {
		return this.find({
			where: { theatres: { id: theatreId } },
			relations: ['theatre'],
		});
	}

	findOwnedShow(userId: string, showId: string) {
		return this.findOne({
			where: { id: showId, user: { id: userId } },
			loadRelationIds: true,
		});
	}
}
