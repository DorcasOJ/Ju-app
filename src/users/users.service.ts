import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JuAppResponse } from 'src/common/helpers';
import { User, User as userEntity } from 'src/entities';
import { Repository } from 'typeorm';

import { encodePassword } from 'src/utils/bcrypt';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(userEntity)
    private readonly userRepository: Repository<userEntity>,
  ) {}

  // createUser(createUserDto: CreateUserDto) {
  //   const password = encodePassword(createUserDto.password);
  //   const newUser = this.userRepository.create({ ...createUserDto, password });
  //   return this.userRepository.save(newUser);
  // }

  findUsersById(id: string) {
    const user = this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        JuAppResponse.NotFoundRequest('Not Found', 'User not found'),
      );
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (!user) {
      throw new NotFoundException(
        JuAppResponse.NotFoundRequest('Not Found', 'not found', '404'),
      );
    }
    return user;
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        JuAppResponse.NotFoundRequest('user not found'),
      );
    }
    Object.assign(user, attrs);
    const updatedUser = this.userRepository.save(user);
    return updatedUser;
  }

  getUsers() {
    return this.userRepository.find();
  }
}
