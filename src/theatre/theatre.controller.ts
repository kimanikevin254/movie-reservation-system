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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { TheatreService } from './theatre.service';

@Controller('theatres')
@ApiTags('theatres')
export class TheatreController {
	constructor(private readonly theatreService: TheatreService) {}

	@Post()
	@ApiOperation({
		summary: 'Create theatre',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	create(@User() user: IUser, @Body() dto: CreateTheatreDto) {
		return this.theatreService.create(user.id, dto);
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get theatre details',
	})
	findOne(@Param('id') id: string) {
		return this.theatreService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update theatre details',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	update(
		@User() user: IUser,
		@Param('id') id: string,
		@Body() dto: UpdateTheatreDto,
	) {
		return this.theatreService.update(user.id, id, dto);
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Deletes a theatre',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	remove(@User() user: IUser, @Param('id') id: string) {
		return this.theatreService.remove(user.id, id);
	}
}
