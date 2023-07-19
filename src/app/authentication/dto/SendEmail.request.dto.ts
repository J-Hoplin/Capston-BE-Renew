import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class SendEmailRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  constructor(data: SendEmailRequestDto) {
    Object.assign(this, data);
  }
}
