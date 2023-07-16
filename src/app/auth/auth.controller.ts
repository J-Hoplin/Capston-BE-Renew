import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('/login')
  public async login() {}

  @Post('/refresh')
  public async refresh() {}
}
