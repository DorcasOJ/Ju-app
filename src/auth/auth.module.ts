import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      publicKey: 'PUBLIC+KEY',
      privateKey: 'PRIVATE_KEY',
    }),
    HttpModule,
  ],
  providers: [
    {
      provide: 'AUTHSERVICE',
      useClass: AuthService,
    },
    JwtHelperService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
