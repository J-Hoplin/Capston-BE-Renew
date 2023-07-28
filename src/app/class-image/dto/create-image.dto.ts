import { ApiProperty } from '@nestjs/swagger';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateImageDto implements Partial<ClassImageEntiy> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  instructor_id!: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  imageOptions: object;
}
