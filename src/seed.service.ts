import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Film, FilmDocument } from './schemas/film.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Film.name) private filmModel: Model<FilmDocument>
  ) {}

  async seedDatabase() {
    console.log('🌱 Début du seed de la base de données...');
    
    // Nettoyer les collections existantes
    await this.userModel.deleteMany({});
    await this.filmModel.deleteMany({});
    console.log('🗑️  Collections nettoyées');

    // Créer les utilisateurs
    await this.seedUsers();
    
    // Créer les films
    await this.seedFilms();
    
    console.log('✅ Seed terminé avec succès !');
  }

  private async seedUsers() {
    console.log('👥 Création des utilisateurs...');
    
    const users = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'user@test.com', 
        password: 'user123',
        role: 'user'
      },
      {
        email: 'moderator@test.com',
        password: 'moderator123',
        role: 'moderator'
      }
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new this.userModel({
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`   ✅ Utilisateur ${userData.role} créé: ${userData.email}`);
    }
  }

  private async seedFilms() {
    console.log('🎬 Création des films...');
    
    const films = [
      {
        title: 'Inception',
        description: 'Un voleur qui infiltre les rêves se voit confier l\'impossible mission d\'implanter une idée.',
        genre: 'Science-Fiction',
        year: 2010,
        rating: 8.8
      },
      {
        title: 'The Dark Knight',
        description: 'Batman affronte le Joker, un criminel psychopathe qui veut plonger Gotham dans l\'anarchie.',
        genre: 'Action',
        year: 2008,
        rating: 9.0
      },
      {
        title: 'Pulp Fiction',
        description: 'Les histoires entremêlées de criminels de Los Angeles racontées dans un style non-linéaire.',
        genre: 'Thriller',
        year: 1994,
        rating: 8.9
      },
      {
        title: 'Forrest Gump',
        description: 'L\'histoire extraordinaire d\'un homme simple qui a vécu des moments historiques.',
        genre: 'Drame',
        year: 1994,
        rating: 8.8
      },
      {
        title: 'The Matrix',
        description: 'Un hacker découvre que la réalité n\'est qu\'une simulation informatique.',
        genre: 'Science-Fiction',
        year: 1999,
        rating: 8.7
      },
      {
        title: 'Goodfellas',
        description: 'L\'ascension et la chute d\'un gangster dans la mafia new-yorkaise.',
        genre: 'Drame',
        year: 1990,
        rating: 8.7
      },
      {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        description: 'Un hobbit entreprend un voyage périlleux pour détruire un anneau maléfique.',
        genre: 'Fantasy',
        year: 2001,
        rating: 8.8
      },
      {
        title: 'Star Wars: Episode IV - A New Hope',
        description: 'La rébellion lutte contre l\'Empire galactique tyrannique.',
        genre: 'Science-Fiction',
        year: 1977,
        rating: 8.6
      },
      {
        title: 'The Shawshank Redemption',
        description: 'L\'amitié entre deux détenus qui trouvent consolation et rédemption en prison.',
        genre: 'Drame',
        year: 1994,
        rating: 9.3
      },
      {
        title: 'Spirited Away',
        description: 'Une petite fille découvre un monde magique peuplé d\'esprits.',
        genre: 'Animation',
        year: 2001,
        rating: 8.6
      }
    ];

    for (const filmData of films) {
      const film = new this.filmModel(filmData);
      await film.save();
      console.log(`   🎬 Film créé: ${filmData.title} (${filmData.year})`);
    }
  }

  // Méthode pour afficher les comptes de test
  getTestAccounts() {
    return [
      {
        role: 'admin',
        email: 'admin@test.com',
        password: 'admin123',
        description: 'Compte administrateur - Accès complet'
      },
      {
        role: 'user',
        email: 'user@test.com',
        password: 'user123',
        description: 'Compte utilisateur standard'
      },
      {
        role: 'moderator',
        email: 'moderator@test.com',
        password: 'moderator123',
        description: 'Compte modérateur - Gestion de contenu'
      }
    ];
  }
} 