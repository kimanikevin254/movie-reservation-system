import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditorium } from '../entities/auditorium.entity';

@Injectable()
export class AuditoriumRepository extends Repository<Auditorium> {
	constructor(
		@InjectRepository(Auditorium)
		private readonly auditoriumRepository: Repository<Auditorium>,
	) {
		super(
			auditoriumRepository.target,
			auditoriumRepository.manager,
			auditoriumRepository.queryRunner,
		);
	}

	findTheatreAuditoriums(theatreId: string) {
		return this.auditoriumRepository.find({
			where: { theatre: { id: theatreId } },
			select: {
				id: true,
				name: true,
				capacity: true,
				createdAt: true,
			},
		});
	}

	findUserAuditorium(userId: string, auditoriumId: string) {
		return this.auditoriumRepository.findOne({
			where: { id: auditoriumId, theatre: { user: { id: userId } } },
		});
	}
}
