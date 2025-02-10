import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowModule } from 'src/show/show.module';
import { TheatreModule } from 'src/theatre/theatre.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => TheatreModule),
		forwardRef(() => ShowModule),
	],
})
export class UserModule {}
