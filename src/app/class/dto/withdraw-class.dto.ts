import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  classId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  constructor(data: WithdrawClassDto) {
    Object.assign(this, data);
  }
}
