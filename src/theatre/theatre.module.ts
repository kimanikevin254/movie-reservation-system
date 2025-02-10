import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Theatre } from './entities/theatre.entity';
import { TheatreRepository } from './repositories/theatre.repository';
import { TheatreController } from './theatre.controller';
import { TheatreService } from './theatre.service';

@Module({
	controllers: [TheatreController],
	providers: [TheatreService, TheatreRepository],
	imports: [
		TypeOrmModule.forFeature([Theatre]),
		forwardRef(() => UserModule),
	],
	exports: [TheatreService],
})
export class TheatreModule {}
