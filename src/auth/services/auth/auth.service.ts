import { UsersService } from 'src/users/services/users/users.service';
import { Injectable, Inject } from '@nestjs/common';
import { comparePasswords } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userService: UsersService,
  ) {}

  async validateuser(username: string, password: string) {
    console.log('Inside Validate User');
    const userDb = await this.userService.findByUsername(username);
    if (userDb) {
      const matched = comparePasswords(password, userDb.password);
      if (matched) {
        console.log('User Validation success');
        return userDb;
      } else {
        console.log('Password does not match!');
        return null;
      }
    }
    console.log('User Validation failed!');
    return null;
  }
}
