import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  serveFrontend(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

  @Get('api/health')
  @ApiTags('health')
  @ApiOperation({ summary: 'Vérifier le statut de l\'API' })
  getHello(): string {
    return this.appService.getHello();
  }
}
