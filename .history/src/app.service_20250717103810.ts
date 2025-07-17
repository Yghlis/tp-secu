import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo.service';

@Injectable()
export class AppService {
  constructor(private mongoService: MongoService) {}

  async getHello(): Promise<string> {
    try {
      const healthCheck = await this.mongoService.healthCheck();
      const userCount = await this.mongoService.getUserCount();
      return `API TP Sécurité - ${healthCheck.database} connectée - ${userCount} utilisateur(s)`;
    } catch (error) {
      return 'API TP Sécurité - Erreur de connexion à la base de données';
    }
  }
}
