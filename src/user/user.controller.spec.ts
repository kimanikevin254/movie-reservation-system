import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { IUser } from 'src/common/interfaces/user.interface';
import { Show } from 'src/show/entities/show.entity';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const moduleMocker = new ModuleMocker(global);

const user = { id: '123' } as IUser;

describe('User Controller', () => {
	let controller: UserController;
	let userService: UserService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [UserController],
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

		controller = module.get<UserController>(UserController);
		userService = module.get<UserService>(UserService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('profile => should return the user details', async () => {
		const returnData = {
			id: '123',
			name: 'User User',
			email: 'user@email.com',
			createdAt: new Date(),
		} as User;

		jest.spyOn(userService, 'profile').mockResolvedValue(returnData);

		const result = await controller.profile(user);

		expect(userService.profile).toHaveBeenCalledWith(user.id);
		expect(result).toEqual(returnData);
	});

	it('userTheatres => should return theatres created by the user', async () => {
		const returnData = [
			{
				id: '123',
				name: 'name',
				location: 'location',
			},
		] as Theatre[];

		jest.spyOn(userService, 'findUserTheatres').mockResolvedValue(
			returnData,
		);

		const result = await controller.userTheatres(user);

		expect(userService.findUserTheatres).toHaveBeenCalledWith(user.id);
		expect(result).toEqual(returnData);
	});

	it('userShows => should return shows created by the user', async () => {
		const returnData = [
			{
				id: '123',
				name: 'name',
				description: 'description',
				rating: 10,
				releaseDate: new Date(),
			},
		] as Show[];

		jest.spyOn(userService, 'findUserShows').mockResolvedValue(returnData);

		const result = await controller.userShows(user);

		expect(userService.findUserShows).toHaveBeenCalledWith(user.id);
		expect(result).toEqual(returnData);
	});
});
