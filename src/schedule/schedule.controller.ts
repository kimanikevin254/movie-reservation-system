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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
@ApiTags('schedules')
export class ScheduleController {
	constructor(private readonly scheduleService: ScheduleService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a schedule for a show in an auditorium',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	create(@User() user: IUser, @Body() createScheduleDto: CreateScheduleDto) {
		return this.scheduleService.create(user.id, createScheduleDto);
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get schedule details',
	})
	findOne(@Param('id') id: string) {
		return this.scheduleService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update schedule details',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	update(
		@User() user: IUser,
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateScheduleDto,
	) {
		return this.scheduleService.update(user.id, id, dto);
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a schedule',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	remove(@User() user: IUser, @Param('id', new ParseUUIDPipe()) id: string) {
		return this.scheduleService.remove(user.id, id);
	}
}
