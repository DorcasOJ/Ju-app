import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ default: 'dcap@email.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'String@1' })
  password: string;
}
