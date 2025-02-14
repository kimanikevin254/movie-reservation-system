import { Test } from '@nestjs/testing';

import { HttpException, HttpStatus } from '@nestjs/common';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { ScheduleService } from 'src/schedule/schedule.service';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { TheatreService } from 'src/theatre/theatre.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Show } from './entities/show.entity';
import { ShowRepository } from './repositories/show.repository';
import { ShowService } from './show.service';

const moduleMocker = new ModuleMocker(global);

const show = {
	id: '123',
	name: 'name',
	duration: 120,
	releaseDate: new Date(),
	description: 'desc',
	rating: 9,
	createdAt: new Date(),
	updatedAt: new Date(),
} as Show;

describe('Show Service', () => {
	let service: ShowService;
	let showRepository: ShowRepository;
	let userService: UserService;
	let theatreService: TheatreService;
	let scheduleService: ScheduleService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [ShowService],
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

		service = module.get<ShowService>(ShowService);
		showRepository = module.get<ShowRepository>(ShowRepository);
		userService = module.get<UserService>(UserService);
		theatreService = module.get<TheatreService>(TheatreService);
		scheduleService = module.get<ScheduleService>(ScheduleService);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('create => should create a show and return sanitized data', async () => {
		const userId = '123';
		const dto: CreateShowDto = {
			name: 'name',
			duration: 120,
			releaseDate: new Date(),
			description: 'desc',
			rating: 9,
		};
		const user = { id: '123' } as User;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { createdAt, updatedAt, ...sanitized } = show;

		jest.spyOn(userService, 'findById').mockResolvedValue(user);
		jest.spyOn(showRepository, 'create').mockReturnValue(show);
		jest.spyOn(showRepository, 'save').mockResolvedValue(show);

		const result = await service.create(userId, dto);

		expect(userService.findById).toHaveBeenCalledWith(userId);
		expect(showRepository.create).toHaveBeenCalledWith({ ...dto, user });
		expect(showRepository.save).toHaveBeenCalledWith(show);
		expect(result).toEqual(sanitized);
	});

	it('findUserShows => should retrieve user shows', async () => {
		const userId = '123';
		const res = [show];

		jest.spyOn(showRepository, 'findUserShows').mockResolvedValue(res);

		const result = await service.findUserShows(userId);

		expect(showRepository.findUserShows).toHaveBeenCalledWith(userId);
		expect(result).toEqual(res);
	});

	describe('findTheatreShows', () => {
		const theatreId = '123';

		it('should throw an error if theatre ID is invalid', async () => {
			const error = new HttpException(
				'Invalid theatre ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(theatreService, 'findById').mockResolvedValue(null);

			await expect(service.findTheatreShows(theatreId)).rejects.toThrow(
				error,
			);
			expect(showRepository.findTheatreShows).not.toHaveBeenCalled();
		});

		it('should return theatre shows', async () => {
			const res = [show];
			const theatre = { id: '123' } as Theatre;

			jest.spyOn(theatreService, 'findById').mockResolvedValue(theatre);
			jest.spyOn(showRepository, 'findTheatreShows').mockResolvedValue(
				res,
			);

			const result = await service.findTheatreShows(theatreId);

			expect(theatreService.findById).toHaveBeenCalledWith(theatreId);
			expect(showRepository.findTheatreShows).toHaveBeenCalledWith(
				theatreId,
			);
			expect(result).toEqual(res);
		});
	});

	it('findOne => should return sanitized show data', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { updatedAt, ...rest } = show;

		jest.spyOn(service, 'findById').mockResolvedValue(show);

		const result = await service.findOne(show.id);

		expect(service.findById).toHaveBeenCalledWith(show.id);
		expect(result).toEqual(rest);
	});

	describe('update', () => {
		const dto: UpdateShowDto = { rating: 10 };
		const userId = '123';

		it('should throw an error if show ID is invalid', async () => {
			const error = new HttpException(
				'Invalid show ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(showRepository, 'findOwnedShow').mockResolvedValue(null);

			await expect(service.update(userId, show.id, dto)).rejects.toThrow(
				error,
			);
			expect(showRepository.update).not.toHaveBeenCalled();
		});

		it('should update a show', async () => {
			jest.spyOn(showRepository, 'findOwnedShow').mockResolvedValue(show);

			await service.update(userId, show.id, dto);

			expect(showRepository.findOwnedShow).toHaveBeenCalledWith(
				userId,
				show.id,
			);
			expect(showRepository.update).toHaveBeenCalledWith(
				{ id: show.id },
				{ ...dto },
			);
		});
	});

	describe('remove', () => {
		const userId = '123';

		it('should throw an error if show ID is invalid', async () => {
			const error = new HttpException(
				'Invalid show ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(showRepository, 'findOwnedShow').mockResolvedValue(null);

			await expect(service.remove(userId, show.id)).rejects.toThrow(
				error,
			);
			expect(showRepository.findOwnedShow).toHaveBeenCalledWith(
				userId,
				show.id,
			);
			expect(showRepository.remove).not.toHaveBeenCalled();
		});

		it('should delete a show', async () => {
			jest.spyOn(showRepository, 'findOwnedShow').mockResolvedValue(show);

			await service.remove(userId, show.id);

			expect(showRepository.findOwnedShow).toHaveBeenCalledWith(
				userId,
				show.id,
			);
			expect(showRepository.remove).toHaveBeenCalledWith(show);
		});
	});

	it('findShowSchedules => should find show schedules', async () => {
		const schedule = {} as Schedule;

		jest.spyOn(scheduleService, 'findShowSchedules').mockResolvedValue([
			schedule,
		]);

		const result = await service.findShowSchedules(show.id);

		expect(scheduleService.findShowSchedules).toHaveBeenCalledWith(show.id);
		expect(result).toEqual([schedule]);
	});
});
