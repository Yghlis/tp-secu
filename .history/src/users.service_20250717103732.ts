import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private mongoService: MongoService) {}

  async create(createUserDto: CreateUserDto) {
    return this.mongoService.createUser(createUserDto);
  }

  async findAll() {
    return this.mongoService.findAllUsers();
  }

  async findOne(id: string) {
    return this.mongoService.findUserById(id);
  }

  async findByEmail(email: string) {
    return this.mongoService.findUserByEmail(email);
  }

  async update(id: string, updateData: any) {
    return this.mongoService.updateUser(id, updateData);
  }

  async remove(id: string) {
    return this.mongoService.deleteUser(id);
  }
} 