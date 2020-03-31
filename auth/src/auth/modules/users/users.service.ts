import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { User } from './users.interface';
import { RegisterUserDTO } from '../../DTO/users';
import { LoginDTO } from 'src/auth/DTO/auth';
import { compare } from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('User Service');
  constructor(
    @InjectModel('User') private userModel: Model<User & mongoose.Document>,
  ) {}

  async register(registerUserDTO: RegisterUserDTO): Promise<User> {
    const createdUser = new this.userModel(registerUserDTO);
    return await createdUser.save();
  }

  async login(loginObject: LoginDTO) {
    const { email, password: passwordAttempt } = loginObject;

    const user = await this.findOneByEmail(email);

    if (!user) {
      return Promise.resolve(null);
    }

    const passwordMatch = await compare(passwordAttempt, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
    };
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async updateLoginDate(email: string) {
    return await this.userModel.update(
      { email },
      { lastLoginDate: Date.now() },
      (err, user) => {
        if (err) {
          throw new InternalServerErrorException('Could not update login date');
        }
        this.logger.verbose('Updated user:', user);
      },
    );
  }
}
