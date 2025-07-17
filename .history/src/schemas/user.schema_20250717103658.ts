import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'users'
})
export class User {
  @ApiProperty({
    description: 'ID unique de l\'utilisateur',
    example: '60d5ecb74b24a1b123456789'
  })
  _id?: string;

  @ApiProperty({
    description: 'Email unique de l\'utilisateur',
    example: 'user@example.com'
  })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
  })
  email: string;

  @ApiProperty({
    description: 'Mot de passe hashé de l\'utilisateur',
    example: '$2b$10$...'
  })
  @Prop({
    required: true,
    minlength: 6
  })
  password: string;

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

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour améliorer les performances
UserSchema.index({ email: 1 }, { unique: true });

// Transformer pour retourner id au lieu de _id
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Ne jamais retourner le mot de passe
    return ret;
  }
});

// Méthode virtuelle pour obtenir l'id
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
}); 