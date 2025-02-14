import { Test } from '@nestjs/testing';

import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Theatre } from '../entities/theatre.entity';
import { TheatreRepository } from './theatre.repository';

const moduleMocker = new ModuleMocker(global);

const theatre = {} as Theatre;

describe('Theatre Repository', () => {
	let repository: TheatreRepository;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [TheatreRepository],
		})
			.useMocker((token) => {
				if (typeof token === 'function') {
					const mockMetadata = moduleMocker.getMetadata(
						token,
					) as MockFunctionMetadata<any, any>;
					const Mock =
						moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		repository = module.get<TheatreRepository>(TheatreRepository);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	it('findUserTheatre => should return a theatre owned by the user', async () => {
		const userId = '123';
		const theatreId = '123';

		jest.spyOn(repository, 'findOne').mockResolvedValue(theatre);

		const result = await repository.findUserTheatre(userId, theatreId);

		expect(repository.findOne).toHaveBeenCalledWith({
			where: { id: theatreId, user: { id: userId } },
			loadRelationIds: true,
		});
		expect(result).toEqual(theatre);
	});

	it('findUserTheatres => should return a theatres owned by the user', async () => {
		const userId = '123';

		jest.spyOn(repository, 'find').mockResolvedValue([theatre]);

		const result = await repository.findUserTheatres(userId);

		expect(repository.find).toHaveBeenCalledWith({
			where: { user: { id: userId } },
			loadRelationIds: true,
		});
		expect(result).toEqual([theatre]);
	});
});
