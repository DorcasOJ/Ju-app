import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/common/decorators/passwordMatch.decorator';

export class PasswordResetDto {
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

  @IsString()
  @IsNotEmpty({ message: 'kindly confirm password' })
  @ApiProperty()
  @MinLength(8)
  @MaxLength(20)
  @Match('password')
  passwordConfirm: string;
}
