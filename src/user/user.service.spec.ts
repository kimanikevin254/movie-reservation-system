import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Show } from 'src/show/entities/show.entity';
import { ShowService } from 'src/show/show.service';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { TheatreService } from 'src/theatre/theatre.service';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const moduleMocker = new ModuleMocker(global);

const theatres = [
	{
		id: '123',
		name: 'Theatre',
		location: 'Location',
	},
] as Theatre[];

const shows = [
	{
		id: '123',
		name: 'Show',
		description: 'description',
		duration: 120,
	},
] as Show[];

const user = {
	id: '123',
	email: 'user@email.com',
	name: 'User User',
	createdAt: new Date(),
	updatedAt: new Date(),
	theatres,
	shows,
} as User;

describe('User Service', () => {
	let service: UserService;
	let userRepository: Repository<User>;
	let theatreService: TheatreService;
	let showService: ShowService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useClass: Repository<User>,
				},
			],
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

		service = module.get<UserService>(UserService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		theatreService = module.get<TheatreService>(TheatreService);
		showService = module.get<ShowService>(ShowService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findByEmail', () => {
		it('should return null if the user with the specified email does not exist', async () => {
			jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

			const result = await service.findByEmail(user.email);

			expect(userRepository.findOne).toHaveBeenCalledWith({
				where: { email: user.email },
			});
			expect(result).toEqual(null);
		});

		it('should return an existing user', async () => {
			jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

			const result = await service.findByEmail(user.email);

			expect(userRepository.findOne).toHaveBeenCalledWith({
				where: { email: user.email },
			});
			expect(result).toEqual(user);
		});
	});

	describe('profile', () => {
		it('should return a sanitized user', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { updatedAt, ...sanitizedUser } = user;

			jest.spyOn(service, 'findById').mockResolvedValue(user);

			const result = await service.profile(user.id);

			expect(service.findById).toHaveBeenCalledWith(user.id);
			expect(result).toEqual(sanitizedUser);
		});
	});

	describe('create', () => {
		it('should create user with email', async () => {
			const data: Partial<User> = {
				email: user.email,
			};
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { name, ...rest } = user;

			jest.spyOn(userRepository, 'create').mockReturnValue({
				email: data.email,
			} as User);
			jest.spyOn(userRepository, 'save').mockResolvedValue(rest as User);

			const result = await service.create(data);

			expect(userRepository.create).toHaveBeenCalledWith({
				email: data.email,
			});
			expect(userRepository.save).toHaveBeenCalledWith({
				email: data.email,
			});
			expect(result).toEqual(rest);
		});
	});

	describe('updateUser', () => {
		const data: Partial<User> = {
			name: user.name,
		};

		it('should throw an error if the specified user ID is invalid', async () => {
			jest.spyOn(service, 'findById').mockResolvedValue(null);

			const error = new HttpException(
				'User with the provided ID does not exist',
				HttpStatus.BAD_REQUEST,
			);

			expect(service.updateUser('invalid-id', data)).rejects.toThrow(
				error,
			);
		});

		it('should update the name of the user', async () => {
			const updateResult: UpdateResult = {
				raw: '' as any,
				affected: 1,
				generatedMaps: [],
			};

			jest.spyOn(service, 'findById').mockResolvedValue(user);
			jest.spyOn(userRepository, 'update').mockResolvedValue(
				updateResult,
			);

			const result = await service.updateUser(user.id, data);

			expect(userRepository.update).toHaveBeenCalledWith(
				{ id: user.id },
				data,
			);
			expect(result).toEqual(result);
		});
	});

	it('should return theatres created by the user', async () => {
		jest.spyOn(theatreService, 'findUserTheatres').mockResolvedValue(
			user.theatres,
		);

		const result = await service.findUserTheatres(user.id);

		expect(result).toEqual(user.theatres);
	});

	it('should return shows created by the user', async () => {
		jest.spyOn(showService, 'findUserShows').mockResolvedValue(user.shows);

		const result = await service.findUserShows(user.id);

		expect(result).toEqual(user.shows);
	});
});
