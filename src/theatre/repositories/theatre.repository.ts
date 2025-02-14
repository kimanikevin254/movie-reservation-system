import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Theatre } from '../entities/theatre.entity';

@Injectable()
export class TheatreRepository extends Repository<Theatre> {
	constructor(@InjectDataSource() dataSource: DataSource) {
		super(Theatre, dataSource.createEntityManager());
	}

	findUserTheatre(userId: string, theatreId: string): Promise<Theatre> {
		return this.findOne({
			where: { id: theatreId, user: { id: userId } },
			loadRelationIds: true,
		});
	}

	findUserTheatres(userId: string) {
		return this.find({
			where: { user: { id: userId } },
			loadRelationIds: true,
		});
	}
}
