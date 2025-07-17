import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Film, FilmDocument } from '../schemas/film.schema';
import { Wishlist, WishlistDocument } from '../schemas/wishlist.schema';

@Injectable()
export class FilmsService {
  constructor(
    @InjectModel(Film.name) private filmModel: Model<FilmDocument>,
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>
  ) {}

  async findAll(): Promise<Film[]> {
    return this.filmModel.find().exec();
  }

  async findOne(id: string): Promise<Film> {
    const film = await this.filmModel.findById(id).exec();
    if (!film) {
      throw new NotFoundException('Film non trouvé');
    }
    return film;
  }

  async addToWishlist(userId: string, filmId: string) {
    // Vérifier que le film existe
    const film = await this.findOne(filmId);
    
    // Vérifier si le film n'est pas déjà dans la wishlist
    const existingWishlist = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      filmId: new Types.ObjectId(filmId)
    }).exec();

    if (existingWishlist) {
      throw new ConflictException('Film déjà présent dans la wishlist');
    }

    // Ajouter à la wishlist
    const wishlistItem = new this.wishlistModel({
      userId: new Types.ObjectId(userId),
      filmId: new Types.ObjectId(filmId)
    });

    await wishlistItem.save();

    return {
      message: 'Film ajouté à la wishlist',
              film: {
          id: (film as any)._id || filmId,
          title: film.title,
          genre: film.genre,
          year: film.year,
          rating: film.rating
        }
    };
  }

  async removeFromWishlist(userId: string, filmId: string) {
    const result = await this.wishlistModel.deleteOne({
      userId: new Types.ObjectId(userId),
      filmId: new Types.ObjectId(filmId)
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Film non trouvé dans la wishlist');
    }

    return {
      message: 'Film retiré de la wishlist'
    };
  }

  async getUserWishlist(userId: string) {
    const wishlistItems = await this.wishlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('filmId')
      .exec();

    const films = wishlistItems.map(item => {
      const film = item.filmId as any;
      return {
        id: film._id || film.id,
        title: film.title,
        description: film.description,
        genre: film.genre,
        year: film.year,
        rating: film.rating,
        addedAt: item.createdAt
      };
    });

    return {
      count: films.length,
      films
    };
  }

  async isInWishlist(userId: string, filmId: string): Promise<{ inWishlist: boolean }> {
    const wishlistItem = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      filmId: new Types.ObjectId(filmId)
    }).exec();

    return {
      inWishlist: !!wishlistItem
    };
  }

  async getAllFilmsWithWishlistStatus(userId: string) {
    const films = await this.findAll();
    const userWishlist = await this.getUserWishlist(userId);
    const wishlistFilmIds = userWishlist.films.map(f => f.id);

    return films.map(film => ({
      ...film.toJSON(),
      inWishlist: wishlistFilmIds.includes(film.id || film._id)
    }));
  }
} 