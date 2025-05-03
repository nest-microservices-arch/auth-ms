import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor() {}

  @MessagePattern('auth.login.user')
  async loginUser() {
    return 'login user';
  }

  @MessagePattern('auth.register.user')
  async registerUser() {
    return 'register user';
  }

  @MessagePattern('auth.verify.user')
  async verifyUser() {
    return 'verify user';
  }
}
