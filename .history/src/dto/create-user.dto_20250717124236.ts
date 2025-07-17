import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'motdepasse123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(100, { message: 'Le mot de passe ne peut pas dépasser 100 caractères' })
  password: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    example: 'user',
    enum: ['admin', 'user', 'moderator'],
    required: false
  })
  @IsOptional()
  @IsEnum(['admin', 'user', 'moderator'], { message: 'Le rôle doit être admin, user ou moderator' })
  role?: string;
} 