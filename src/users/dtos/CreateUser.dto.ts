import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'fullname cannot be empty' })
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  fullName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'email cannot be empty' })
  @ApiProperty({
    description: 'This is a required property',
  })
  email: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, {
    message:
      'Password cannot be short. Minimal lenght is $constriant1 characters, but actual is $value',
  })
  @MaxLength(20, {
    message:
      'Password is too long. Minimal lenght is $constriant1 characters, but actual is $value',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain the following: a capital letter, a number and a special character',
  })
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  password: string;
}
