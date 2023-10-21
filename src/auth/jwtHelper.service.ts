import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants/jwt.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { JuAppResponse } from 'src/common/helpers';
import { pbkdf2Sync, randomBytes } from 'crypto';

@Injectable()
export class JwtHelperService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwTokenService: JwtService,
    private configService: ConfigService,
  ) {}

  async signAccess(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    return this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.refresh_secret),
      expiresIn: await this.configService.get(jwtConstants.access_time),
    });
  }

  async signRefresh(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    const refreshToken = this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.refresh_secret),
      expiresIn: await this.configService.get(jwtConstants.refresh_time),
    });

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });
    await this.userRepository.update(user.id, { refreshToken }).catch((err) => {
      throw new BadRequestException(
        JuAppResponse.BadRequest('user not found', 'This user does not exist'),
      );
    });
    return refreshToken;
  }

  async getNewTokens(refreshToken: string) {
    try {
      let payload = this.jwTokenService.verify(refreshToken, {
        secret: await this.configService.get(jwtConstants.refresh_secret),
      });
      payload = {
        id: payload.id,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      };

      const verified = await this.userRepository.findOne({
        where: {
          refreshToken: refreshToken,
        },
      });

      if (verified) {
        return {
          access: await this.signAccess(payload),
        };
      } else throw new Error();
    } catch (error) {
      throw new BadRequestException(
        JuAppResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again',
        ),
      );
    }
  }

  async forgetPassword(
    payload: { id: string; email: string },
    password: string,
  ) {
    const secretCombo =
      (await this.configService.get(jwtConstants.reset_secret)) + password;
    return this.jwTokenService.sign(payload, {
      secret: secretCombo,
      expiresIn: await this.configService.get(jwtConstants.reset_time),
    });
  }

  async verifyResetToken(token: string, password: string) {
    const secretCombo =
      (await this.configService.get(jwtConstants.reset_secret)) + password;
    try {
      const payload = await this.jwTokenService.verify(token, {
        secret: secretCombo,
      });
      return payload;
    } catch (error) {
      throw new ForbiddenException(
        JuAppResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async hashPassword(password: string, salt?: string) {
    if (!salt) salt = randomBytes(32).toString('hex');
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const hashedPassword = `${salt}:${hash}`;
    return hashedPassword;
  }
}
