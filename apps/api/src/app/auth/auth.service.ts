import { RegistrationStatus } from 'apps/api/src/app/auth/interfaces/registration-status.interface';
import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Model, PassportLocalModel } from 'mongoose';
import { IUser } from '../users/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { debug } from 'console';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
              @InjectModel('User') private readonly userModel: PassportLocalModel<IUser>) { }

              // TODO: review this promise
  async register(user: IUser) {
    let status: RegistrationStatus = { success: true, message: 'user register' };
    await this.userModel.register(new this.userModel({username: user.email,
      firstName: user.firstName,
      lastName: user.lastName}), user.password, (err) => {
      if (err) {
        debug(err);
        status = { success: false, message: err };
      }
    });
    return status;
  }

  createToken(user) {
    const expiresIn = 3600;

    const accessToken = jwt.sign({ id: user.id,
      email: user.username,
      firstname: user.firstName,
      lastname: user.lastName }, process.env.JWT_KEY, { expiresIn });
    return {
      expiresIn,
      accessToken,
    };
  }
  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.usersService.findById(payload.id);
  }
}
