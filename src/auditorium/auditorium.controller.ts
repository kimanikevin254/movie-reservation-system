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
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { AuditoriumService } from './auditorium.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';

@Controller('theatre/:theatreId/auditorium')
export class AuditoriumController {
	constructor(private readonly auditoriumService: AuditoriumService) {}

	@UseGuards(AuthGuard)
	@Post()
	create(
		@User() user: IUser,
		@Param('theatreId') theatreId: string,
		@Body() dto: CreateAuditoriumDto,
	) {
		return this.auditoriumService.create(user.id, theatreId, dto);
	}

	@Get()
	findAll(@Param('theatreId') theatreId: string) {
		return this.auditoriumService.findTheatreAuditoriums(theatreId);
	}

	@Get(':auditoriumId')
	findOne(@Param('auditoriumId') auditoriumId: string) {
		return this.auditoriumService.findOne(auditoriumId);
	}

	@UseGuards(AuthGuard)
	@Patch(':auditoriumId')
	update(
		@User() user: IUser,
		@Param('auditoriumId') auditoriumId: string,
		@Body() dto: UpdateAuditoriumDto,
	) {
		return this.auditoriumService.update(user.id, auditoriumId, dto);
	}

	@UseGuards(AuthGuard)
	@Delete(':auditoriumId')
	remove(@User() user: IUser, @Param('auditoriumId') auditoriumId: string) {
		return this.auditoriumService.remove(user.id, auditoriumId);
	}
}
