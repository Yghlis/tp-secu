import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FilmDocument = Film & Document;

@Schema({
  timestamps: true,
  collection: 'films'
})
export class Film {
  @ApiProperty({
    description: 'ID unique du film',
    example: '60d5ecb74b24a1b123456789'
  })
  _id?: string;

  @ApiProperty({
    description: 'Titre du film',
    example: 'Inception'
  })
  @Prop({
    required: true,
    trim: true
  })
  title: string;

  @ApiProperty({
    description: 'Description du film',
    example: 'Un thriller de science-fiction captivant'
  })
  @Prop({
    required: true
  })
  description: string;

  @ApiProperty({
    description: 'Genre du film',
    example: 'Science-Fiction',
    enum: ['Action', 'Aventure', 'Comédie', 'Drame', 'Fantasy', 'Horreur', 'Romance', 'Science-Fiction', 'Thriller', 'Animation']
  })
  @Prop({
    required: true,
    enum: ['Action', 'Aventure', 'Comédie', 'Drame', 'Fantasy', 'Horreur', 'Romance', 'Science-Fiction', 'Thriller', 'Animation']
  })
  genre: string;

  @ApiProperty({
    description: 'Année de sortie',
    example: 2010
  })
  @Prop({
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5
  })
  year: number;

  @ApiProperty({
    description: 'Note du film (sur 10)',
    example: 8.8
  })
  @Prop({
    required: true,
    min: 0,
    max: 10
  })
  rating: number;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-01-17T10:00:00.000Z'
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2025-01-17T10:00:00.000Z'
  })
  updatedAt?: Date;
}

export const FilmSchema = SchemaFactory.createForClass(Film);

// Transformer pour retourner id au lieu de _id
FilmSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Méthode virtuelle pour obtenir l'id
FilmSchema.virtual('id').get(function() {
  return this._id.toString();
}); 