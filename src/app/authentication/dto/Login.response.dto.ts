import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
  constructor(data: LoginResponseDto) {
    Object.assign(this, data);
  }
}
