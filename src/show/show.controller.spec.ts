import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Show } from './entities/show.entity';
import { ShowController } from './show.controller';
import { ShowService } from './show.service';

const moduleMocker = new ModuleMocker(global);

const user = { id: '123' } as IUser;
const show = { id: '123' } as Show;

describe('Show Controller', () => {
	let controller: ShowController;
	let showService: ShowService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [ShowController],
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

		controller = module.get<ShowController>(ShowController);
		showService = module.get<ShowService>(ShowService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('create => should create a show', async () => {
		const dto: CreateShowDto = {
			name: 'name',
			duration: 120,
			releaseDate: new Date(),
			description: 'desc',
			rating: 9,
		};

		const res = { id: '123' } as Show;

		jest.spyOn(showService, 'create').mockResolvedValue(res);

		const result = await controller.create(user, dto);

		expect(showService.create).toHaveBeenCalledWith(user.id, dto);
		expect(result).toEqual(res);
	});

	it('findOne => should get details of a show', async () => {
		const id = '123';

		jest.spyOn(showService, 'findOne').mockResolvedValue(show);

		const result = await controller.findOne(id);

		expect(showService.findOne).toHaveBeenCalledWith(id);
		expect(result).toEqual(show);
	});

	it('update => should update a show', async () => {
		const dto: UpdateShowDto = {
			rating: 9,
		};

		await controller.update(user, show.id, dto);

		expect(showService.update).toHaveBeenCalledWith(user.id, show.id, dto);
	});

	it('delete => show delete a show', async () => {
		await controller.remove(user, show.id);

		expect(showService.remove).toHaveBeenCalledWith(user.id, show.id);
	});

	it('showSchedules => should return show schedules', async () => {
		const schedules = {} as Schedule[];

		jest.spyOn(showService, 'findShowSchedules').mockResolvedValue(
			schedules,
		);

		const result = await controller.showSchedules(show.id);

		expect(showService.findShowSchedules).toHaveBeenCalledWith(show.id);
		expect(result).toEqual(schedules);
	});
});
