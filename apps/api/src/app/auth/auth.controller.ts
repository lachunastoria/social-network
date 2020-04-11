import { Controller, UseGuards, HttpStatus, Response, Post, Body } from '@nestjs/common';
import { CreateUserDto } from 'apps/api/src/app/users/dtos/create-user.dto';
import { LoginUserDto } from 'apps/api/src/app/users/dtos/login-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly usersService: UsersService) {}

  @Post('register')
  public async register(@Response() res, @Body() createUserDto: CreateUserDto){
    const result = await this.authService.register(createUserDto);
    if (!result.success){
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  public async login(@Response() res, @Body() login: LoginUserDto){
    return await this.usersService.findOne({ username: login.email}).then(user => {
      if (!user) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'User Not Found',
        });
      } else {
        console.log('start getting the token');
        const token = this.authService.createToken(user);
        console.log(token);
        return res.status(HttpStatus.OK).json(token);
      }
    });
  }
}
