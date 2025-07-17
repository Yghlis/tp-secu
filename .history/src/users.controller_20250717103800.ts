import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id || user._id,
          email: user.email,
          createdAt: user.createdAt || new Date()
        }
      };
    } catch (error) {
      if (error.code === 11000 || error.name === 'MongoServerError') {
        throw new HttpException('Email déjà utilisé', HttpStatus.CONFLICT);
      }
      throw new HttpException('Erreur lors de la création', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée' })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user.id,
      email: user.email
    }));
  }
} 