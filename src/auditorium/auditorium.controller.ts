import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { AuditoriumService } from './auditorium.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';

@Controller('theatres/:theatreId/auditoriums')
@ApiTags('auditoriums')
export class AuditoriumController {
	constructor(private readonly auditoriumService: AuditoriumService) {}

	@Post()
	@ApiOperation({
		summary: 'Create an auditorium',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	create(
		@User() user: IUser,
		@Param('theatreId') theatreId: string,
		@Body() dto: CreateAuditoriumDto,
	) {
		return this.auditoriumService.create(user.id, theatreId, dto);
	}

	@Get()
	@ApiOperation({
		summary: 'Retrieves all theatre auditoriums',
	})
	findAll(@Param('theatreId') theatreId: string) {
		return this.auditoriumService.findTheatreAuditoriums(theatreId);
	}

	@Get(':auditoriumId')
	@ApiOperation({
		summary: 'Retrieve auditorium details',
	})
	findOne(
		@Param('theatreId') theatreId: string,
		@Param('auditoriumId') auditoriumId: string,
	) {
		return this.auditoriumService.findOne(auditoriumId);
	}

	@Patch(':auditoriumId')
	@ApiOperation({
		summary: 'Update auditorium details',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	update(
		@User() user: IUser,
		@Param('auditoriumId') auditoriumId: string,
		@Body() dto: UpdateAuditoriumDto,
	) {
		return this.auditoriumService.update(user.id, auditoriumId, dto);
	}

	@Delete(':auditoriumId')
	@ApiOperation({
		summary: 'Delete auditorium',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	remove(@User() user: IUser, @Param('auditoriumId') auditoriumId: string) {
		return this.auditoriumService.remove(user.id, auditoriumId);
	}

	@Get(':auditoriumId/schedules')
	@ApiOperation({
		summary: 'Get auditorium schedules',
	})
	auditoriumSchedules(
		@Param('theatreId') theatreId: string,
		@Param('auditoriumId', new ParseUUIDPipe()) auditoriumId: string,
	) {
		return this.auditoriumService.auditoriumSchedules(
			theatreId,
			auditoriumId,
		);
	}
}
