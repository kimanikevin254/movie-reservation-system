import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuditoriumService } from 'src/auditorium/auditorium.service';
import { Auditorium } from 'src/auditorium/entities/auditorium.entity';
import { Show } from 'src/show/entities/show.entity';
import { ShowService } from 'src/show/show.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleRepository } from './repositories/schedule.repository';
import { ScheduleService } from './schedule.service';

const moduleMocker = new ModuleMocker(global);

const userId = '123';
const auditorium = { id: '123' } as Auditorium;
const show = { id: '123', duration: 120 } as Show;

const schedule = {
	id: '123',
	show,
	auditorium,
} as Schedule;

describe('Schedule Service', () => {
	let service: ScheduleService;
	let scheduleRepository: ScheduleRepository;
	let showService: ShowService;
	let auditoriumService: AuditoriumService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [ScheduleService],
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

		service = module.get<ScheduleService>(ScheduleService);
		scheduleRepository = module.get<ScheduleRepository>(ScheduleRepository);
		showService = module.get<ShowService>(ShowService);
		auditoriumService = module.get<AuditoriumService>(AuditoriumService);

		// Ensure mocks are cleared before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		const dto: CreateScheduleDto = {
			auditoriumId: '123',
			showId: '123',
			startTime: new Date(),
		};

		const startTime = new Date(dto.startTime);
		const endTime = new Date(startTime.getTime() + show.duration * 60000);

		it('should throw an error if provided with an invalid auditorium ID(or one that does not belong to user)', async () => {
			const error = new HttpException(
				'Invalid auditorium ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(auditoriumService, 'findById').mockResolvedValue(null);

			await expect(service.create(userId, dto)).rejects.toThrow(error);
			expect(auditoriumService.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				dto.auditoriumId,
			);
			expect(showService.findById).not.toHaveBeenCalled();
			expect(
				scheduleRepository.findOverlappingSchedules,
			).not.toHaveBeenCalled();
			expect(scheduleRepository.create).not.toHaveBeenCalled();
			expect(scheduleRepository.save).not.toHaveBeenCalled();
		});

		it('should throw an error if provided with an invalid show ID(or one that does not belong to user)', async () => {
			const error = new HttpException(
				'Invalid Show ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(
				auditoriumService,
				'findUserAuditorium',
			).mockResolvedValue(auditorium);
			jest.spyOn(showService, 'findById').mockResolvedValue(null);

			await expect(service.create(userId, dto)).rejects.toThrow(error);
			expect(auditoriumService.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				dto.auditoriumId,
			);
			expect(showService.findById).toHaveBeenCalledWith(dto.showId);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).not.toHaveBeenCalled();
			expect(scheduleRepository.create).not.toHaveBeenCalled();
			expect(scheduleRepository.save).not.toHaveBeenCalled();
		});

		it('should throw an error if provided with a conflicting schedule', async () => {
			const error = new HttpException(
				`Schedule conflicts with an existing booking.`,
				HttpStatus.CONFLICT,
			);

			jest.spyOn(
				auditoriumService,
				'findUserAuditorium',
			).mockResolvedValue(auditorium);
			jest.spyOn(showService, 'findById').mockResolvedValue(show);
			jest.spyOn(
				scheduleRepository,
				'findOverlappingSchedules',
			).mockResolvedValue(1);

			await expect(service.create(userId, dto)).rejects.toThrow(error);
			expect(auditoriumService.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				dto.auditoriumId,
			);
			expect(showService.findById).toHaveBeenCalledWith(dto.showId);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).toHaveBeenCalledWith(auditorium.id, startTime, endTime);
			expect(scheduleRepository.create).not.toHaveBeenCalled();
			expect(scheduleRepository.save).not.toHaveBeenCalled();
		});

		it('should create and save a new schedule', async () => {
			const sanitizedRes = {
				id: '123',
			};

			jest.spyOn(
				auditoriumService,
				'findUserAuditorium',
			).mockResolvedValue(auditorium);
			jest.spyOn(showService, 'findById').mockResolvedValue(show);
			jest.spyOn(
				scheduleRepository,
				'findOverlappingSchedules',
			).mockResolvedValue(0);
			jest.spyOn(scheduleRepository, 'create').mockReturnValue(schedule);
			jest.spyOn(scheduleRepository, 'save').mockResolvedValue(schedule);

			const result = await service.create(userId, dto);

			expect(auditoriumService.findUserAuditorium).toHaveBeenCalledWith(
				userId,
				dto.auditoriumId,
			);
			expect(showService.findById).toHaveBeenCalledWith(dto.showId);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).toHaveBeenCalledWith(auditorium.id, startTime, endTime);
			expect(scheduleRepository.create).toHaveBeenCalledWith({
				show,
				auditorium,
				startTime,
				endTime,
			});
			expect(scheduleRepository.save).toHaveBeenCalledWith(schedule);
			expect(result).toEqual(sanitizedRes);
		});
	});

	it('findAuditoriumSchedules => should return auditorium schdules', async () => {
		const theatreId = '123';

		jest.spyOn(
			scheduleRepository,
			'findAuditoriumSchedules',
		).mockResolvedValue([schedule]);

		const result = await service.findAuditoriumSchedules(
			theatreId,
			auditorium.id,
		);

		expect(scheduleRepository.findAuditoriumSchedules).toHaveBeenCalledWith(
			theatreId,
			auditorium.id,
		);
		expect(result).toEqual([schedule]);
	});

	it('findShowSchedules => should return show schedules', async () => {
		jest.spyOn(scheduleRepository, 'findShowSchedules').mockResolvedValue([
			schedule,
		]);

		const result = await service.findShowSchedules(show.id);

		expect(scheduleRepository.findShowSchedules).toHaveBeenCalledWith(
			show.id,
		);
		expect(result).toEqual([schedule]);
	});

	describe('findOne', () => {
		it('should throw an error if provided with an invalid schedule ID', async () => {
			const error = new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(service, 'findById').mockResolvedValue(null);

			await expect(service.findOne(schedule.id)).rejects.toThrow(error);
		});

		it('should return a sanitized schedule', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { updatedAt, ...sanitized } = schedule;

			jest.spyOn(service, 'findById').mockResolvedValue(schedule);

			const result = await service.findOne(schedule.id);

			expect(service.findById).toHaveBeenCalledWith(schedule.id);
			expect(result).toEqual(sanitized);
		});
	});

	describe('update', () => {
		const dto: UpdateScheduleDto = {
			startTime: new Date(),
		};
		const startTime = new Date(dto.startTime);
		const endTime = new Date(
			startTime.getTime() + schedule.show.duration * 60000,
		);

		it('should throw an error if provided with an invalid schedule ID', async () => {
			const error = new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(
				scheduleRepository,
				'findOwnedSchedule',
			).mockResolvedValue(null);

			await expect(
				service.update(userId, schedule.id, dto),
			).rejects.toThrow(error);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).not.toHaveBeenCalled();
			expect(scheduleRepository.update).not.toHaveBeenCalled();
		});
		it('should throw a conflict exception if the new start start time conflicts with another schedule', async () => {
			const error = new HttpException(
				`Schedule conflicts with an existing booking.`,
				HttpStatus.CONFLICT,
			);

			jest.spyOn(
				scheduleRepository,
				'findOwnedSchedule',
			).mockResolvedValue(schedule);
			jest.spyOn(
				scheduleRepository,
				'findOverlappingSchedules',
			).mockResolvedValue(1);

			await expect(
				service.update(userId, schedule.id, dto),
			).rejects.toThrow(error);
			expect(scheduleRepository.findOwnedSchedule).toHaveBeenCalledWith(
				userId,
				schedule.id,
			);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).toHaveBeenCalledWith(schedule.auditorium.id, startTime, endTime);
			expect(scheduleRepository.update).not.toHaveBeenCalled();
		});
		it('should update a schedule', async () => {
			const dto: UpdateScheduleDto = {
				startTime: new Date(),
			};
			const startTime = new Date(dto.startTime);
			const endTime = new Date(
				startTime.getTime() + schedule.show.duration * 60000,
			);

			jest.spyOn(
				scheduleRepository,
				'findOwnedSchedule',
			).mockResolvedValue(schedule);
			jest.spyOn(
				scheduleRepository,
				'findOverlappingSchedules',
			).mockResolvedValue(0);

			await service.update(userId, schedule.id, dto);
			expect(scheduleRepository.findOwnedSchedule).toHaveBeenCalledWith(
				userId,
				schedule.id,
			);
			expect(
				scheduleRepository.findOverlappingSchedules,
			).toHaveBeenCalledWith(schedule.auditorium.id, startTime, endTime);
			expect(scheduleRepository.update).toHaveBeenCalledWith(
				schedule.id,
				{ startTime, endTime },
			);
		});
	});

	describe('remove', () => {
		it('should throw an error if provided with an invalid schedule ID', async () => {
			const error = new HttpException(
				'Invalid schedule ID',
				HttpStatus.NOT_FOUND,
			);

			jest.spyOn(
				scheduleRepository,
				'findOwnedSchedule',
			).mockResolvedValue(null);

			await expect(service.remove(userId, schedule.id)).rejects.toThrow(
				error,
			);
			expect(scheduleRepository.delete).not.toHaveBeenCalled();
		});

		it('should delete a schedule', async () => {
			jest.spyOn(
				scheduleRepository,
				'findOwnedSchedule',
			).mockResolvedValue(schedule);

			await service.remove(userId, schedule.id);

			expect(scheduleRepository.findOwnedSchedule).toHaveBeenCalledWith(
				userId,
				schedule.id,
			);
			expect(scheduleRepository.delete).toHaveBeenCalledWith(schedule.id);
		});
	});
});
