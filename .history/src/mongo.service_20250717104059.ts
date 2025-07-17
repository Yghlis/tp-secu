import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  // === USERS ===
  
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    
    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
  }

  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).select('-password').exec();
  }

  // === HEALTH CHECK ===

  async healthCheck(): Promise<{ status: string; database: string }> {
    try {
      await this.userModel.db.db.admin().ping();
      return {
        status: 'ok',
        database: 'mongodb'
      };
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  // === UTILITY METHODS ===

  async getUserCount(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user.toObject();
      return result as User;
    }
    return null;
  }
} 