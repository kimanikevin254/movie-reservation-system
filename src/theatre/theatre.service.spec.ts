import { Test } from '@nestjs/testing';

import { HttpException, HttpStatus } from '@nestjs/common';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { Theatre } from './entities/theatre.entity';
import { TheatreRepository } from './repositories/theatre.repository';
import { TheatreService } from './theatre.service';

const moduleMocker = new ModuleMocker(global);

const theatre = {
	id: '123',
	name: 'name',
	location: 'location',
	createdAt: new Date(),
	updatedAt: new Date(),
} as Theatre;

describe('Theatre Service', () => {
	let service: TheatreService;
	let theatreRepository: TheatreRepository;
	let userService: UserService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [TheatreService],
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

		service = module.get<TheatreService>(TheatreService);
		theatreRepository = module.get<TheatreRepository>(TheatreRepository);
		userService = module.get<UserService>(UserService);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('create => shoould create a theatre and return sanitized data', async () => {
		const dto: CreateTheatreDto = {
			name: 'Name',
			location: 'Location',
		};
		const user = { id: '123' } as User;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { createdAt, updatedAt, ...sanitized } = theatre;

		jest.spyOn(userService, 'findById').mockResolvedValue(user);
		jest.spyOn(theatreRepository, 'create').mockReturnValue(theatre);
		jest.spyOn(theatreRepository, 'save').mockResolvedValue(theatre);

		const result = await service.create(user.id, dto);

		expect(userService.findById).toHaveBeenCalledWith(user.id);
		expect(theatreRepository.create).toHaveBeenCalledWith({ ...dto, user });
		expect(theatreRepository.save).toHaveBeenCalledWith(theatre);
		expect(result).toEqual(sanitized);
	});

	it('findOne => should return sanitized theatre details', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { updatedAt, ...sanitized } = theatre;
		jest.spyOn(service, 'findById').mockResolvedValue(theatre);

		const result = await service.findOne(theatre.id);

		expect(service.findById).toHaveBeenCalledWith(theatre.id);
		expect(result).toEqual(sanitized);
	});

	it('findUserTheatre => should find user theatre', async () => {
		const userId = '123';

		jest.spyOn(theatreRepository, 'findUserTheatre').mockResolvedValue(
			theatre,
		);

		const result = await service.findUserTheatre(userId, theatre.id);

		expect(theatreRepository.findUserTheatre).toHaveBeenCalledWith(
			userId,
			theatre.id,
		);
		expect(result).toEqual(theatre);
	});

	it('findUserTheatres => should find user theatres', async () => {
		const userId = '123';

		jest.spyOn(theatreRepository, 'findUserTheatres').mockResolvedValue([
			theatre,
		]);

		const result = await service.findUserTheatres(userId);

		expect(theatreRepository.findUserTheatres).toHaveBeenCalledWith(userId);
		expect(result).toEqual([theatre]);
	});

	describe('update', () => {
		const userId = '123';
		const dto: UpdateTheatreDto = {
			name: 'New name',
		};

		it('should throw an error of provided with invalid ID', async () => {
			const error = new HttpException(
				'Invalid theatre ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(theatreRepository, 'findUserTheatre').mockResolvedValue(
				null,
			);

			await expect(
				service.update(userId, theatre.id, dto),
			).rejects.toThrow(error);
			expect(theatreRepository.update).not.toHaveBeenCalled();
		});

		it('should update a theatre', async () => {
			jest.spyOn(theatreRepository, 'findUserTheatre').mockResolvedValue(
				theatre,
			);

			await service.update(userId, theatre.id, dto);

			expect(theatreRepository.findUserTheatre).toHaveBeenCalledWith(
				userId,
				theatre.id,
			);
			expect(theatreRepository.update).toHaveBeenCalledWith(
				{ id: theatre.id },
				{ ...dto },
			);
		});
	});

	describe('remove', () => {
		const userId = '123';

		it('should throw an error of provided with invalid ID', async () => {
			const error = new HttpException(
				'Invalid theatre ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(theatreRepository, 'findUserTheatre').mockResolvedValue(
				null,
			);

			await expect(service.remove(userId, theatre.id)).rejects.toThrow(
				error,
			);
			expect(theatreRepository.delete).not.toHaveBeenCalled();
		});

		it('should remove a theatre', async () => {
			jest.spyOn(theatreRepository, 'findUserTheatre').mockResolvedValue(
				theatre,
			);

			await service.remove(userId, theatre.id);

			expect(theatreRepository.findUserTheatre).toHaveBeenCalledWith(
				userId,
				theatre.id,
			);
			expect(theatreRepository.delete).toHaveBeenCalledWith({
				id: theatre.id,
			});
		});
	});
});
