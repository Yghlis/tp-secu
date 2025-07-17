import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  providers: [AppService, PrismaService, UsersService],
  exports: [PrismaService],
})
export class AppModule {}
