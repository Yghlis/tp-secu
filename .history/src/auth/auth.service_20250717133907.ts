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
    console.log('🚨 VULNERABLE QUERY:', { email, password });
    
    try {
      // FAILLE CRITIQUE: Les paramètres sont utilisés directement dans la requête MongoDB
      // Cela permet l'injection d'opérateurs comme {"$ne": null}, {"$regex": "admin"}, etc.
      const query: any = {};
      
      if (email !== undefined) {
        query.email = email;  // INJECTION POSSIBLE ICI
      }
      
      console.log('🚨 MONGODB QUERY:', JSON.stringify(query, null, 2));
      
      // Requête vulnérable - MongoDB interprète les objets JSON comme des opérateurs
      const user = await this.userModel.findOne(query).select('+password');
      
      if (user) {
        console.log('🚨 USER FOUND:', { email: user.email, role: user.role });
        
        // BYPASS DU MOT DE PASSE: Si password est un objet (injection), on skip la vérification
        if (typeof password === 'string') {
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (isValidPassword) {
            const { password: _, ...result } = (user as any).toObject();
            return result;
          }
        } else {
          // FAILLE CRITIQUE: Injection détectée, on bypasse la vérification
          console.log('🚨 PASSWORD BYPASS - INJECTION DETECTED!');
          const { password: _, ...result } = (user as any).toObject();
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('🚨 VULNERABLE AUTH ERROR:', error);
      throw error;
    }
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