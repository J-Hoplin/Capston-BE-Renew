import { ApiProperty } from '@nestjs/swagger';
import { status } from '@src/infrastructure/types/class-image';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class PatchImageStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    enum: status,
  })
  @IsNotEmpty()
  @IsEnum(status)
  status: status;
  constructor(data: PatchImageStatusDto) {
    Object.assign(this, data);
  }
}
