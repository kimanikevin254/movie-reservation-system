import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { AuditoriumController } from './auditorium.controller';
import { AuditoriumService } from './auditorium.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { Auditorium } from './entities/auditorium.entity';

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

describe('Auditorium Controller', () => {
	let controller: AuditoriumController;
	let auditoriumService: AuditoriumService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [AuditoriumController],
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

		controller = module.get<AuditoriumController>(AuditoriumController);
		auditoriumService = module.get<AuditoriumService>(AuditoriumService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('create => should create an auditorium for a theatre', async () => {
		const user = { id: '123' } as IUser;
		const theatreId = '123';
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

		jest.spyOn(auditoriumService, 'create').mockResolvedValue(auditorium);

		const result = await controller.create(user, theatreId, dto);

		expect(auditoriumService.create).toHaveBeenCalledWith(
			user.id,
			theatreId,
			dto,
		);
		expect(result).toEqual(auditorium);
	});

	it('findTheatreAuditoriums => should return all theatre auditoriums', async () => {
		const theatreId = '123';

		jest.spyOn(
			auditoriumService,
			'findTheatreAuditoriums',
		).mockResolvedValue([auditorium]);

		const result = await controller.findTheatreAuditoriums(theatreId);

		expect(
			auditoriumService.findTheatreAuditoriums,
		).toHaveBeenLastCalledWith(theatreId);
		expect(result).toEqual([auditorium]);
	});

	it('findOne => should retrieve auditorium details', async () => {
		const auditoriumId = '123';

		jest.spyOn(auditoriumService, 'findOne').mockResolvedValue(auditorium);

		const result = await controller.findOne(auditoriumId);

		expect(auditoriumService.findOne).toHaveBeenCalledWith(auditoriumId);
		expect(result).toEqual(auditorium);
	});

	it('update => should update auditorium details', async () => {
		const user = { id: '123' } as IUser;
		const dto: Partial<CreateAuditoriumDto> = {
			capacity: 100,
		};
		const res = {
			message: 'Updated successfully',
		};

		jest.spyOn(auditoriumService, 'update').mockResolvedValue(res);

		const result = await controller.update(user, auditorium.id, dto);

		expect(auditoriumService.update).toHaveBeenCalledWith(
			user.id,
			auditorium.id,
			dto,
		);
		expect(result).toEqual(res);
	});

	it('remove => should delete specified auditorium', async () => {
		const user = { id: '123' } as IUser;
		const res = {
			message: 'Deleted successfully',
		};

		jest.spyOn(auditoriumService, 'remove').mockResolvedValue(res);

		const result = await controller.remove(user, auditorium.id);

		expect(auditoriumService.remove).toHaveBeenCalledWith(
			user.id,
			auditorium.id,
		);
		expect(result).toEqual(res);
	});

	it('auditoriumSchedules => should retrieve auditorium schedules', async () => {
		const theatreId = '123';
		const res = [
			{
				id: '123',
				// other fields
			},
		] as Schedule[];

		jest.spyOn(auditoriumService, 'auditoriumSchedules').mockResolvedValue(
			res,
		);

		const result = await controller.auditoriumSchedules(
			theatreId,
			auditorium.id,
		);

		expect(auditoriumService.auditoriumSchedules).toHaveBeenCalledWith(
			theatreId,
			auditorium.id,
		);
		expect(result).toEqual(res);
	});
});
