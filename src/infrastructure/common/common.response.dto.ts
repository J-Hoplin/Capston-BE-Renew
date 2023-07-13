import { ApiProperty } from '@nestjs/swagger';

export class CommonResponseDto {
  @ApiProperty()
  msg: any;
  constructor(msg: any) {
    this.msg = msg;
  }
}
