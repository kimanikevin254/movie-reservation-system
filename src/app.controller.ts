import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class AppController {
	@Get()
	@ApiOperation({
		summary: 'API status',
		description: 'Checks the status of the API',
	})
	getHealth() {
		return { status: 'ok' };
	}
}
