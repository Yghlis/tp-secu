import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { SeedService } from './seed.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private mongoService: MongoService,
    private seedService: SeedService
  ) {}

  async onModuleInit() {
    try {
      const userCount = await this.mongoService.getUserCount();
      if (userCount === 0) {
        console.log('🌱 Base de données vide, lancement du seed automatique...');
        await this.seedService.seedDatabase();
        console.log('📋 Comptes de test créés :');
        this.seedService.getTestAccounts().forEach(account => {
          console.log(`   - ${account.role}: ${account.email} / ${account.password}`);
        });
      }
    } catch (error) {
      console.log('⚠️  Erreur lors du seed automatique:', error.message);
    }
  }

  async getHello(): Promise<string> {
    try {
      const healthCheck = await this.mongoService.healthCheck();
      const userCount = await this.mongoService.getUserCount();
      
      let message = `API TP Sécurité - ${healthCheck.database} connectée - ${userCount} utilisateur(s)`;
      
      if (userCount > 0) {
        message += '\n\n📋 Comptes de test disponibles:';
        this.seedService.getTestAccounts().forEach(account => {
          message += `\n- ${account.role}: ${account.email} / ${account.password}`;
        });
      }
      
      return message;
    } catch (error) {
      return 'API TP Sécurité - Erreur de connexion à la base de données';
    }
  }
}
