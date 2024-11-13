import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async findUserByUniqueAttribute(data: Prisma.UserWhereUniqueInput) {
		return await this.prismaService.user.findUnique({
			where: { ...data },
		});
	}

	async profile(userId: string) {
		const user = await this.findUserByUniqueAttribute({ id: userId });

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...rest } = user;

		return rest;
	}

	async create(data: Prisma.UserCreateInput) {
		// Check if user exists
		const user = await this.findUserByUniqueAttribute({
			email: data.email,
		});

		if (user) {
			throw new HttpException(
				'This email address is already registered',
				HttpStatus.BAD_REQUEST,
			);
		}

		// Create the user
		return this.prismaService.user.create({
			data: {
				name: data.name,
				email: data.email,
				passwordHash: data.passwordHash,
			},
			select: {
				id: true,
			},
		});
	}

	async updateUser(userId: string, data: Prisma.UserUpdateInput) {
		// Check if user exists
		const user = await this.findUserByUniqueAttribute({
			id: userId,
		});

		if (!user) {
			throw new HttpException(
				'User with the provided ID does not exist',
				HttpStatus.BAD_REQUEST,
			);
		}

		return this.prismaService.user.update({
			where: { id: userId },
			data,
		});
	}
}
