import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [UserService],
	imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
