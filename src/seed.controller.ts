import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Initialiser la base avec des données de test' })
  @ApiResponse({ status: 200, description: 'Base de données initialisée avec succès' })
  async seed() {
    await this.seedService.seedDatabase();
    return {
      message: '✅ Base de données initialisée avec succès',
      accounts: this.seedService.getTestAccounts()
    };
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Afficher les comptes de test disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des comptes de test' })
  async getTestAccounts() {
    return {
      message: '📋 Comptes de test disponibles',
      accounts: this.seedService.getTestAccounts()
    };
  }
} 