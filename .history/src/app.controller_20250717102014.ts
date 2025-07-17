import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller('api/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Vérifier le statut de l\'API' })
  getHello(): string {
    return this.appService.getHello();
  }
}
