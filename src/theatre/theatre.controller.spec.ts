import { Test } from '@nestjs/testing';

import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { IUser } from 'src/common/interfaces/user.interface';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { Theatre } from './entities/theatre.entity';
import { TheatreController } from './theatre.controller';
import { TheatreService } from './theatre.service';

const moduleMocker = new ModuleMocker(global);

const user = { id: '123' } as IUser;
const theatre = { id: '123' } as Theatre;

describe('Theatre Controller', () => {
	let controller: TheatreController;
	let theatreService: TheatreService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [TheatreController],
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

		controller = module.get<TheatreController>(TheatreController);
		theatreService = module.get<TheatreService>(TheatreService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('create => should create a theatre', async () => {
		const dto: CreateTheatreDto = {
			name: 'Name',
			location: 'Location',
		};

		jest.spyOn(theatreService, 'create').mockResolvedValue(theatre);

		const result = await controller.create(user, dto);

		expect(theatreService.create).toHaveBeenCalledWith(user.id, dto);
		expect(result).toEqual(theatre);
	});

	it('findOne => should find theatre details', async () => {
		jest.spyOn(theatreService, 'findOne').mockResolvedValue(theatre);

		const result = await controller.findOne(theatre.id);

		expect(theatreService.findOne).toHaveBeenCalledWith(theatre.id);
		expect(result).toEqual(result);
	});

	it('update => should update a theatre', async () => {
		const dto: UpdateTheatreDto = {
			name: 'NEW name',
		};

		await controller.update(user, theatre.id, dto);

		expect(theatreService.update).toHaveBeenCalledWith(
			user.id,
			theatre.id,
			dto,
		);
	});

	it('remove => should delete a theatre', async () => {
		await controller.remove(user, theatre.id);

		expect(theatreService.remove).toHaveBeenCalledWith(user.id, theatre.id);
	});
});
