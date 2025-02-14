import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

const moduleMocker = new ModuleMocker(global);

describe('Schedule Controller', () => {
	let controller: ScheduleController;
	let scheduleService: ScheduleService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [ScheduleController],
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

		controller = module.get<ScheduleController>(ScheduleController);
		scheduleService = module.get<ScheduleService>(ScheduleService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('create => should create a schedule', async () => {
		const user = { id: '123' } as IUser;
		const dto: CreateScheduleDto = {
			auditoriumId: '123',
			showId: '123',
			startTime: new Date(),
		};
		const res = { id: '123' } as Schedule;

		jest.spyOn(scheduleService, 'create').mockResolvedValue(res);

		const result = await controller.create(user, dto);

		expect(scheduleService.create).toHaveBeenCalledWith(user.id, dto);
		expect(result).toEqual(res);
	});

	it('findOne => should retrieve a schedule', async () => {
		const id = '123';
		const res = { id: '123' } as Schedule;

		jest.spyOn(scheduleService, 'findOne').mockResolvedValue(res);

		const result = await controller.findOne(id);

		expect(scheduleService.findOne).toHaveBeenCalledWith(id);
		expect(result).toEqual(result);
	});

	it('update => should update a schedule', async () => {
		const user = { id: '123' } as IUser;
		const scheduleId = '123';
		const dto = { startTime: new Date() } as UpdateScheduleDto;

		await controller.update(user, scheduleId, dto);

		expect(scheduleService.update).toHaveBeenCalledWith(
			user.id,
			scheduleId,
			dto,
		);
	});

	it('update => should delete a schedule', async () => {
		const user = { id: '123' } as IUser;
		const scheduleId = '123';

		await controller.remove(user, scheduleId);

		expect(scheduleService.remove).toHaveBeenCalledWith(
			user.id,
			scheduleId,
		);
	});
});
