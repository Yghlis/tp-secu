import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.schema';
import { Film } from './film.schema';

export type WishlistDocument = Wishlist & Document;

@Schema({
  timestamps: true,
  collection: 'wishlists'
})
export class Wishlist {
  @ApiProperty({
    description: 'ID unique de la wishlist',
    example: '60d5ecb74b24a1b123456789'
  })
  _id?: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: '60d5ecb74b24a1b123456789'
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true
  })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'ID du film',
    example: '60d5ecb74b24a1b123456789'
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Film',
    required: true
  })
  filmId: Types.ObjectId;

  @ApiProperty({
    description: 'Date d\'ajout à la wishlist',
    example: '2025-01-17T10:00:00.000Z'
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date de modification',
    example: '2025-01-17T10:00:00.000Z'
  })
  updatedAt?: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Index pour éviter les doublons
WishlistSchema.index({ userId: 1, filmId: 1 }, { unique: true });

// Transformer pour retourner id au lieu de _id
WishlistSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Méthode virtuelle pour obtenir l'id
WishlistSchema.virtual('id').get(function() {
  return this._id.toString();
}); 