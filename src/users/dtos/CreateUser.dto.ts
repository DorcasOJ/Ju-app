import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  email: string;
}
