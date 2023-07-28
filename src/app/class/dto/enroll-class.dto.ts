import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnrollClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  classId: number;
}
