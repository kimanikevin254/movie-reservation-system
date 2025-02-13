import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { ScheduleService } from 'src/schedule/schedule.service';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { TheatreService } from 'src/theatre/theatre.service';
import { AuditoriumService } from './auditorium.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { Auditorium } from './entities/auditorium.entity';
import { AuditoriumRepository } from './repositories/auditorium.repository';

const moduleMocker = new ModuleMocker(global);

const auditorium = {
	id: '123',
	name: 'name',
	capacity: 100,
	seatMap: {
		rows: [
			{
				row: 'A',
				seats: [
					{
						column: 1,
						seatNumber: 'A1',
					},
					{
						column: 2,
						seatNumber: 'A2',
					},
				],
			},
		],
	},
	updatedAt: new Date(),
	createdAt: new Date(),
} as Auditorium;

describe('Auditorium Service', () => {
	let service: AuditoriumService;
	let auditoriumRepository: AuditoriumRepository;
	let theatreService: TheatreService;
	let scheduleService: ScheduleService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [AuditoriumService],
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

		service = module.get<AuditoriumService>(AuditoriumService);
		auditoriumRepository =
			module.get<AuditoriumRepository>(AuditoriumRepository);
		theatreService = module.get<TheatreService>(TheatreService);
		scheduleService = module.get<ScheduleService>(ScheduleService);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findOne', () => {
		it('should throw not found error when an invalid ID is provided', async () => {
			jest.spyOn(service, 'findById').mockResolvedValue(null);

			expect(service.findOne(auditorium.id)).rejects.toThrow(
				new HttpException(
					'Invalid auditorium ID',
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it('should return sanitized auditorium data', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { updatedAt, ...sanitizedData } = auditorium;

			jest.spyOn(service, 'findById').mockResolvedValue(auditorium);

			const result = await service.findOne(auditorium.id);

			expect(service.findById).toHaveBeenCalledWith(auditorium.id);
			expect(result).toEqual(sanitizedData);
		});
	});

	describe('create', () => {
		const userId = '123';
		const theatreId = '456';
		const dto: CreateAuditoriumDto = {
			name: 'Auditorium Two',
			capacity: 100,
			seatMap: [
				{
					row: 'A',
					seats: [
						{
							column: 1,
							seatNumber: 'A1',
						},
						{
							column: 2,
							seatNumber: 'A2',
						},
					],
				},
			],
		};
		it('should throw an error if the theater specified does not belong to user', async () => {
			jest.spyOn(theatreService, 'findUserTheatre').mockResolvedValue(
				null,
			);

			await expect(
				service.create(userId, theatreId, dto),
			).rejects.toThrow(
				new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
			);
			expect(theatreService.findUserTheatre).toHaveBeenCalledWith(
				userId,
				theatreId,
			);
			expect(auditoriumRepository.create).not.toHaveBeenCalled();
		});

		it('should create an auditorium and return sanitized data', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { createdAt, updatedAt, seatMap, ...sanitizedData } =
				auditorium;

			const theatre = {
				id: '123',
				name: 'name',
				location: 'location',
			} as Theatre;

			const mappedSeatMap = {
				rows: dto.seatMap.map((row) => ({
					row: row.row,
					seats: row.seats.map((seat) => ({
						column: seat.column,
						seatNumber: seat.seatNumber,
					})),
				})),
			};

			jest.spyOn(theatreService, 'findUserTheatre').mockResolvedValue(
				theatre,
			);
			jest.spyOn(auditoriumRepository, 'create').mockReturnValue({
				...dto,
				seatMap: mappedSeatMap,
				theatre,
			} as Auditorium);
			jest.spyOn(auditoriumRepository, 'save').mockResolvedValue(
				auditorium,
			);

			const result = await service.create(userId, theatreId, dto);

			expect(theatreService.findUserTheatre).toHaveBeenCalledWith(
				userId,
				theatreId,
			);
			expect(auditoriumRepository.create).toHaveBeenCalledWith({
				...dto,
				seatMap: mappedSeatMap,
				theatre,
			});
			expect(auditoriumRepository.save).toHaveBeenCalledWith({
				...dto,
				seatMap: mappedSeatMap,
				theatre,
			});
			expect(result).toEqual(sanitizedData);
		});
	});

	describe('findTheatreAuditoriums', () => {
		it('should throw an error if invalid theatre ID is provided', async () => {
			jest.spyOn(theatreService, 'findById').mockResolvedValue(null);

			await expect(
				service.findTheatreAuditoriums('invalid-theatre-id'),
			).rejects.toThrow(
				new HttpException('Invalid theatre ID', HttpStatus.NOT_FOUND),
			);
		});

		it('should return thetre auditoriums', async () => {
			const theatre = {
				id: '123',
				name: 'name',
				location: 'location',
			} as Theatre;

			jest.spyOn(theatreService, 'findById').mockResolvedValue(theatre);
			jest.spyOn(
				auditoriumRepository,
				'findTheatreAuditoriums',
			).mockResolvedValue([auditorium]);

			const result = await service.findTheatreAuditoriums(theatre.id);

			expect(theatreService.findById).toHaveBeenCalledWith(theatre.id);
			expect(
				auditoriumRepository.findTheatreAuditoriums,
			).toHaveBeenCalledWith(theatre.id);
			expect(result).toEqual(result);
		});
	});

	describe('update', () => {
		const userId = '123';
		const auditoriumId = '123';
		const dto: UpdateAuditoriumDto = {
			capacity: 100,
		};

		it('should throw an error if the specifed auditorium does not belong to user', async () => {
			jest.spyOn(service, 'findUserAuditorium').mockResolvedValue(null);

			await expect(
				service.update(userId, auditoriumId, dto),
			).rejects.toThrow(
				new HttpException(
					'Invalid auditorium ID',
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it('should update auditorium details', async () => {
			jest.spyOn(service, 'findUserAuditorium').mockResolvedValue(
				auditorium,
			);
			const result = await service.update(userId, auditoriumId, dto);

			expect(service.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				auditoriumId,
			);
			expect(auditoriumRepository.update).toHaveBeenCalledWith(
				{ id: auditoriumId },
				dto,
			);
			expect(result).toEqual({
				message: 'Auditorium updated successfully',
			});
		});
	});

	describe('remove', () => {
		const userId = '123';
		const auditoriumId = '123';

		it('should throw an error if the specifed auditorium does not belong to user', async () => {
			jest.spyOn(service, 'findUserAuditorium').mockResolvedValue(null);

			await expect(service.remove(userId, auditoriumId)).rejects.toThrow(
				new HttpException(
					'Invalid auditorium ID',
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it('should delete auditorium', async () => {
			jest.spyOn(service, 'findUserAuditorium').mockResolvedValue(
				auditorium,
			);
			const result = await service.remove(userId, auditoriumId);

			expect(service.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				auditoriumId,
			);
			expect(auditoriumRepository.delete).toHaveBeenCalledWith(
				auditoriumId,
			);
			expect(result).toEqual({
				message: 'Deleted successfully',
			});
		});
	});

	describe('findUserAuditorium', () => {
		it('should return null if the auditorium with the specified ID does not belong to user', async () => {
			jest.spyOn(
				auditoriumRepository,
				'findUserAuditorium',
			).mockResolvedValue(null);

			const result = await service.findUserAuditorium(
				'123',
				auditorium.id,
			);

			expect(
				auditoriumRepository.findUserAuditorium,
			).toHaveBeenCalledWith('123', auditorium.id);
			expect(result).toEqual(null);
		});

		it('should the user auditorium', async () => {
			jest.spyOn(
				auditoriumRepository,
				'findUserAuditorium',
			).mockResolvedValue(auditorium);

			const result = await service.findUserAuditorium(
				'123',
				auditorium.id,
			);

			expect(
				auditoriumRepository.findUserAuditorium,
			).toHaveBeenCalledWith('123', auditorium.id);
			expect(result).toEqual(auditorium);
		});
	});

	describe('auditoriumSchedules', () => {
		it('should return the auditorium schedules', async () => {
			jest.spyOn(
				scheduleService,
				'findAuditoriumSchedules',
			).mockResolvedValue([] as Schedule[]);

			const result = await service.auditoriumSchedules(
				'123',
				auditorium.id,
			);

			expect(
				scheduleService.findAuditoriumSchedules,
			).toHaveBeenCalledWith('123', auditorium.id);
			expect(result).toEqual([]);
		});
	});
});
