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
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ShowService } from './show.service';

@Controller('shows')
@ApiTags('shows')
export class ShowController {
	constructor(private readonly showService: ShowService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a show',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	create(@User() user: IUser, @Body() createShowDto: CreateShowDto) {
		return this.showService.create(user.id, createShowDto);
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get the details of a show',
	})
	findOne(@Param('id') id: string) {
		return this.showService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update show details',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	update(
		@User() user: IUser,
		@Param('id') id: string,
		@Body() updateShowDto: UpdateShowDto,
	) {
		return this.showService.update(user.id, id, updateShowDto);
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a show',
	})
	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	remove(@User() user: IUser, @Param('id') id: string) {
		return this.showService.remove(user.id, id);
	}

	@Get(':id/schedules')
	@ApiOperation({
		summary: 'Get show schedules',
	})
	showSchedules(@Param('id') id: string) {
		return this.showService.findShowSchedules(id);
	}
}
