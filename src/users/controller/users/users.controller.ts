import {
  Body,
  Post,
  Controller,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import {
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Inject,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SerializedUser } from 'src/users/types';
import { UserNotFoundException } from 'src/users/exceptions.ts/UserNotFound.exception';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userService: UsersService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  getUsers() {
    return this.userService.getUsers();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('id/:id')
  @ApiOkResponse({ description: 'The resources were returned succesfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findUsersById(id);
    if (user) return new SerializedUser(user);
    else throw new UserNotFoundException();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('username/:username')
  @ApiOkResponse({ description: 'The resources were returned succesfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  async findUserByUsername(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);
    if (user) return new SerializedUser(user);
    else throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
