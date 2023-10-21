import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Redirect,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { UserDto } from 'src/users/dtos/user.dto';
import { SignInDto } from './dto/signin.dto';
import { PasswordForgotEmailDto } from 'src/users/dtos/passwordEmail.dto';
import { PasswordResetDto } from 'src/users/dtos/passwordReset.dto';
import { Request } from 'express';
import { RefreshTokenDto } from 'src/users/dtos/ResetAccessToken.dto';

@ApiTags('Auth-Users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Serialize(UserDto)
  @Post('/signup')
  @ApiOperation({ description: 'Sign up a user' })
  async signUpUser(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(body);
    return user;
  }

  @Post('/signin')
  @ApiOperation({ description: 'Sign in a User' })
  async signInUser(@Body() dto: SignInDto, @Req() req: Request) {
    return await this.authService.signin(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: String(req.headers['ip']),
    });
  }

  @Post('signout')
  @ApiOperation({ description: 'Sign out a User' })
  async signOutUser(@Body() body: RefreshTokenDto) {
    return await this.authService.signout(body.RefreshToken);
  }

  @Post('/token')
  @ApiOperation({ description: 'Get new access token' })
  getAccess(@Body() body: RefreshTokenDto) {
    return this.authService.getNewToken(body.RefreshToken);
  }

  @Serialize(UserDto)
  @Post('/forgot/post')
  @ApiOperation({ description: 'submit email for password reset' })
  async forgotPassword(@Body() body: PasswordForgotEmailDto) {
    const link = await this.authService.forgotPassword(body.email);
    // Redirect(link);
    return link;
  }

  @Serialize(UserDto)
  @Post('/reset/:id/:token')
  @ApiOperation({ description: 'password reset function' })
  async resetPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
    @Body() body: PasswordResetDto,
  ) {
    const updatedUser = await this.authService.resetPassword(id, token, body);
    return updatedUser;
  }
}
