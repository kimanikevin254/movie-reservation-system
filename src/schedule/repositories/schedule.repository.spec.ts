import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleRepository } from './schedule.repository';

const moduleMocker = new ModuleMocker(global);

const schedule = {
	id: '123',
	startTime: new Date('2024-02-14T10:00:00Z'),
	endTime: new Date('2024-02-14T12:00:00Z'),
	show: {
		id: '123',
		name: 'Test Show',
		duration: 120,
		user: { id: 'user1' },
	},
	auditorium: {
		id: '123',
		name: 'Auditorium 1',
		theatre: {
			id: 'theatre1',
			name: 'Theatre 1',
		},
	},
} as Schedule;

describe('ScheduleRepository', () => {
	let repository: ScheduleRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ScheduleRepository],
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

		repository = module.get<ScheduleRepository>(ScheduleRepository);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	describe('findAuditoriumSchedules', () => {
		it('should find schedules for a specific auditorium in a theatre', async () => {
			const theatreId = '123';
			const auditoriumId = '123';
			const expectedSchedules = [schedule];

			jest.spyOn(repository, 'find').mockResolvedValue(expectedSchedules);

			const result = await repository.findAuditoriumSchedules(
				theatreId,
				auditoriumId,
			);

			expect(repository.find).toHaveBeenCalledWith({
				where: {
					auditorium: {
						id: auditoriumId,
						theatre: { id: theatreId },
					},
				},
				select: {
					id: true,
					startTime: true,
					endTime: true,
					show: {
						id: true,
						name: true,
						duration: true,
					},
				},
				relations: ['show'],
			});
			expect(result).toEqual(expectedSchedules);
		});

		it('should return empty array when no schedules found', async () => {
			jest.spyOn(repository, 'find').mockResolvedValue([]);

			const result = await repository.findAuditoriumSchedules(
				'theatre1',
				'aud1',
			);

			expect(result).toEqual([]);
		});
	});

	describe('findShowSchedules', () => {
		it('should find all schedules for a specific show', async () => {
			const showId = '123';
			const expectedSchedules = [schedule];

			jest.spyOn(repository, 'find').mockResolvedValue(expectedSchedules);

			const result = await repository.findShowSchedules(showId);

			expect(repository.find).toHaveBeenCalledWith({
				where: { show: { id: showId } },
				select: {
					id: true,
					startTime: true,
					endTime: true,
					auditorium: {
						id: true,
						name: true,
						theatre: {
							id: true,
							name: true,
						},
					},
				},
				relations: ['auditorium', 'auditorium.theatre'],
			});
			expect(result).toEqual(expectedSchedules);
		});

		it('should return empty array when no schedules found', async () => {
			jest.spyOn(repository, 'find').mockResolvedValue([]);

			const result = await repository.findShowSchedules('123');

			expect(result).toEqual([]);
		});
	});

	describe('findOwnedSchedule', () => {
		it('should find a schedule owned by the user', async () => {
			const userId = '123';
			const scheduleId = '123';

			jest.spyOn(repository, 'findOne').mockResolvedValue(schedule);

			const result = await repository.findOwnedSchedule(
				userId,
				scheduleId,
			);

			expect(repository.findOne).toHaveBeenCalledWith({
				where: { id: scheduleId, show: { user: { id: userId } } },
				relations: ['show', 'auditorium'],
			});
			expect(result).toEqual(schedule);
		});

		it('should return null when schedule not found', async () => {
			jest.spyOn(repository, 'findOne').mockResolvedValue(null);

			const result = await repository.findOwnedSchedule('123', '123');

			expect(result).toBeNull();
		});
	});

	describe('findOverlappingSchedules', () => {
		it('should count overlapping schedules', async () => {
			const auditoriumId = '123';
			const startTime = new Date('2024-02-14T10:00:00Z');
			const endTime = new Date('2024-02-14T12:00:00Z');
			const expectedCount = 1;

			jest.spyOn(repository, 'count').mockResolvedValue(expectedCount);

			const result = await repository.findOverlappingSchedules(
				auditoriumId,
				startTime,
				endTime,
			);

			expect(repository.count).toHaveBeenCalledWith({
				where: {
					auditorium: { id: auditoriumId },
					startTime,
					endTime,
				},
			});
			expect(result).toBe(expectedCount);
		});

		it('should return 0 when no overlapping schedules found', async () => {
			jest.spyOn(repository, 'count').mockResolvedValue(0);

			const result = await repository.findOverlappingSchedules(
				'123',
				new Date(),
				new Date(),
			);

			expect(result).toBe(0);
		});
	});
});
