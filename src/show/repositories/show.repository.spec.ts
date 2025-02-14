import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Show } from '../entities/show.entity';
import { ShowRepository } from './show.repository';

const moduleMocker = new ModuleMocker(global);

const show = { id: '123', name: 'name' } as Show;

describe('Show Repository', () => {
	let repository: ShowRepository;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [ShowRepository],
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

		repository = module.get<ShowRepository>(ShowRepository);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	it('findUserShows => should find user shows', async () => {
		const userId = '123';
		const res = [show];

		jest.spyOn(repository, 'find').mockResolvedValue(res);

		const result = await repository.findUserShows(userId);

		expect(repository.find).toHaveBeenCalledWith({
			where: { user: { id: userId } },
			relations: ['user'],
		});
		expect(result).toEqual(res);
	});

	it('findTheatreShows => should find theatre shows', async () => {
		const theatreId = '123';
		const res = [show];

		jest.spyOn(repository, 'find').mockResolvedValue(res);

		const result = await repository.findTheatreShows(theatreId);

		expect(repository.find).toHaveBeenCalledWith({
			where: { theatres: { id: theatreId } },
			relations: ['theatre'],
		});
		expect(result).toEqual(res);
	});

	it('findOwnedShow => should find owned show', async () => {
		const userId = '123';
		const showId = '123';

		jest.spyOn(repository, 'findOne').mockResolvedValue(show);

		const result = await repository.findOwnedShow(userId, showId);

		expect(repository.findOne).toHaveBeenCalledWith({
			where: { id: showId, user: { id: userId } },
			loadRelationIds: true,
		});
		expect(result).toEqual(show);
	});
});
