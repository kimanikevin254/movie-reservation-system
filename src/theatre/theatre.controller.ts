import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { TheatreService } from './theatre.service';

@Controller('theatre')
export class TheatreController {
	constructor(private readonly theatreService: TheatreService) {}

	@UseGuards(AuthGuard)
	@Post()
	@ApiOperation({
		summary: 'Create theatre',
	})
	create(@User() user: IUser, @Body() dto: CreateTheatreDto) {
		return this.theatreService.create(user.id, dto);
	}

	@Get()
	findAll() {
		return this.theatreService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.theatreService.findOne(id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id')
	update(
		@User() user: IUser,
		@Param('id') id: string,
		@Body() dto: UpdateTheatreDto,
	) {
		return this.theatreService.update(user.id, id, dto);
	}

	@UseGuards(AuthGuard)
	@Delete(':id')
	remove(@User() user: IUser, @Param('id') id: string) {
		return this.theatreService.remove(user.id, id);
	}
}
