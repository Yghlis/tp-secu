import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'jwt-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      return null;
    }
    
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
} 