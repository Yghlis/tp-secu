import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { Film, FilmSchema } from '../schemas/film.schema';
import { Wishlist, WishlistSchema } from '../schemas/wishlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema },
      { name: Wishlist.name, schema: WishlistSchema }
    ])
  ],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {} 