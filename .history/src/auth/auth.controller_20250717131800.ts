import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    if (!req.user) {
      throw new Error('User not found');
    }

    const token = await this.authService.generateJwt(req.user);
    return {
      access_token: token,
      user: {
        id: (req.user as any)._id || (req.user as any).id,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    };
  }

  // ENDPOINT VULNÉRABLE - Permet l'injection NoSQL
  @Post('login-vulnerable')
  async loginVulnerable(@Body() credentials: any) {
    // FAILLE DE SÉCURITÉ: Accepte directement l'objet JSON sans validation
    // Permet l'injection d'opérateurs MongoDB comme {"$ne": null}
    const user = await this.authService.validateUserVulnerable(credentials.email, credentials.password);
    
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = await this.authService.generateJwt(user);
    return {
      success: true,
      access_token: token,
      user: {
        id: (user as any)._id || (user as any).id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    const token = await this.authService.generateJwt(user);
    
    return {
      access_token: token,
      user: {
        id: (user as any)._id || (user as any).id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
} 