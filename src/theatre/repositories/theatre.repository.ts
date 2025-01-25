import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theatre } from '../entities/theatre.entity';

@Injectable()
export class TheatreRepository extends Repository<Theatre> {
	constructor(
		@InjectRepository(Theatre)
		private readonly theatreRepository: Repository<Theatre>,
	) {
		super(
			theatreRepository.target,
			theatreRepository.manager,
			theatreRepository.queryRunner,
		);
	}

	findUserTheatre(userId: string, theatreId: string): Promise<Theatre> {
		return this.theatreRepository.findOne({
			where: { id: theatreId, user: { id: userId } },
		});
	}
}
