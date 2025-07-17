import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = (user as any).toObject();
      return result;
    }
    return null;
  }

  // MÉTHODE VULNÉRABLE - Permet l'injection NoSQL
  async validateUserVulnerable(email: any, password: any): Promise<any> {
    // FAILLE DE SÉCURITÉ: Utilise directement les paramètres dans la requête MongoDB
    // Permet l'injection d'opérateurs MongoDB comme {"$ne": null}
    console.log('🚨 VULNERABLE QUERY:', { email, password });
    
    // Cette requête est vulnérable car elle accepte des objets JSON directement
    // Exemple d'exploitation: {"email": {"$ne": null}, "password": {"$ne": null}}
    const user = await this.userModel.findOne({ 
      email: email,
      // La vérification du mot de passe est aussi vulnérable
      $where: `this.password != null` // Injection possible ici aussi
    }).select('+password');

    if (user) {
      // Si on trouve un utilisateur, on fait une vérification minimale du mot de passe
      // mais qui peut aussi être contournée avec l'injection
      if (typeof password === 'string') {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          const { password: _, ...result } = (user as any).toObject();
          return result;
        }
      } else {
        // FAILLE: Si password n'est pas une string (ex: objet avec $ne), on bypasse la vérification
        console.log('🚨 PASSWORD BYPASS DETECTED!');
        const { password: _, ...result } = (user as any).toObject();
        return result;
      }
    }

    return null;
  }

  async generateJwt(user: any) {
    const payload = { 
      email: user.email, 
      sub: (user as any)._id || user.id,
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new UnauthorizedException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = new this.userModel({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'user',
      createdAt: new Date()
    });

    await user.save();
    
    const { password, ...result } = (user as any).toObject();
    return result;
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }
} 
} 