import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FilmsService } from './films.service';

@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les films' })
  @ApiResponse({ status: 200, description: 'Liste des films' })
  async findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un film par ID' })
  @ApiResponse({ status: 200, description: 'Film trouvé' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.filmsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('wishlist/:filmId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter un film à la wishlist' })
  @ApiResponse({ status: 201, description: 'Film ajouté à la wishlist' })
  @ApiResponse({ status: 409, description: 'Film déjà dans la wishlist' })
  async addToWishlist(@Param('filmId') filmId: string, @Request() req) {
    return this.filmsService.addToWishlist(req.user.id, filmId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('wishlist/:filmId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirer un film de la wishlist' })
  @ApiResponse({ status: 200, description: 'Film retiré de la wishlist' })
  async removeFromWishlist(@Param('filmId') filmId: string, @Request() req) {
    return this.filmsService.removeFromWishlist(req.user.id, filmId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('wishlist/my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer ma wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist de l\'utilisateur' })
  async getMyWishlist(@Request() req) {
    return this.filmsService.getUserWishlist(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('wishlist/check/:filmId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier si un film est dans la wishlist' })
  @ApiResponse({ status: 200, description: 'Statut du film dans la wishlist' })
  async checkInWishlist(@Param('filmId') filmId: string, @Request() req) {
    return this.filmsService.isInWishlist(req.user.id, filmId);
  }
} 