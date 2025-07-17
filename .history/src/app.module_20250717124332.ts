import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoService } from './mongo.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SeedService } from './seed.service';
import { User, UserSchema } from './schemas/user.schema';
import { Film, FilmSchema } from './schemas/film.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/tp_secu', {
      retryAttempts: 5,
      retryDelay: 1000,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Film.name, schema: FilmSchema }
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '',
      exclude: ['/api*'],
      serveStaticOptions: {
        index: 'index.html',
      },
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, MongoService, UsersService, SeedService],
  exports: [MongoService],
})
export class AppModule {}
