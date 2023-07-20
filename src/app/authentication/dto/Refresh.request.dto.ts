import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;

  constructor(data: RefreshRequestDto) {
    Object.assign(this, data);
  }
}
