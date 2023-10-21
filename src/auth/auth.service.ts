import { UsersService } from 'src/users/users.service';
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { comparePasswords } from 'src/utils/bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { JwtHelperService } from 'src/auth/jwtHelper.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { JuAppResponse } from 'src/common/helpers';
import { configConstant } from 'src/common/constants/config.constant';
import { SignInDto } from './dto/signin.dto';
import { PasswordResetDto } from 'src/users/dtos/passwordReset.dto';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtHelperService: JwtHelperService,
    private readonly configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async signup(user: CreateUserDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.userRepository.save(userdata).catch((e) => {
      throw new BadRequestException(
        JuAppResponse.BadRequest('Duplicate Value', e),
      );
    });

    // return 'success, n profile yet'; 'The Email already exists'
    return newUser;

    // send post request to the profile service to create the profile through axios
    // const newProfile = this.httpService.post(
    //   `${this.configService.get<string>(
    //     configConstant.profileUrl.baseUrl,
    //   )}/profile/create`,
    //   {
    //     user_id: newUser.id,
    //     email: newUser.email,
    //   },
    // );
    // to be continued...
  }

  async signin(
    dto: SignInDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user)
      throw JuAppResponse.BadRequest('Not Found', 'Invalid Credentials');

    const hash = await this.jwtHelperService.hashPassword(
      dto.password,
      user.password.split(':')[0],
    );
    const isPasswordCorrect = hash == user.password;
    if (!isPasswordCorrect)
      throw JuAppResponse.BadRequest('Access Denied!', 'Incorrect Credentials');
    const tokens = await this.getNewRefreshAndAccessTokens(values, user);
    return JuAppResponse.Ok<object>(
      {
        ...tokens,
        userId: user.id,
        profileId: user.profileID,
        email: user.email,
        fullName: user.fullName,
      },
      'Successfully loged in',
      201,
    );
  }

  async signout(refreshToken: string) {
    const check = await this.userRepository.findOne({
      where: { refreshToken: refreshToken },
    });
    if (!check)
      throw new BadRequestException(
        JuAppResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again',
        ),
      );
    await this.userRepository.update(
      { refreshToken: refreshToken },
      { refreshToken: null },
    );
    return JuAppResponse.Ok('', 'Successfully logged out', 201);
  }

  async getNewToken(refreshToken: string) {
    return await this.jwtHelperService.getNewTokens(refreshToken);
  }

  async getNewRefreshAndAccessTokens(
    values: { userAgent: string; ipAddress: string },
    user,
  ) {
    const refreshObject = {
      userAgent: values.userAgent,
      ipAddress: values.ipAddress,
      id: user.id,
    };
    return {
      access: await this.jwtHelperService.signAccess(refreshObject),
      refresh: await this.jwtHelperService.signRefresh(refreshObject),
    };
  }

  async forgotPassword(email: string) {
    const user: User = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        JuAppResponse.NotFoundRequest(
          'Not Found',
          'email does not exist on the server',
          '404',
        ),
      );
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    const currentPassword = user.password;
    const resetToken = await this.jwtHelperService.forgetPassword(
      payload,
      currentPassword,
    );
    const resetLink = `http://localhost:3000/api/auth/reset/${user.id}/${resetToken}`;
    // await this.mailService.sendResetLink(user, resetLink) -> this is to send the reset link to the user's email instead
    return resetLink;
  }

  async resetPassword(id: string, token: string, body: PasswordResetDto) {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        JuAppResponse.NotFoundRequest('User does not exist on the server'),
      );
    }

    await this.jwtHelperService.verifyResetToken(token, user.password);
    const hashedPassword = await this.jwtHelperService.hashPassword(
      body.password,
    );
    await this.userRepository.update(id, { password: hashedPassword });
    return user;
  }
}
