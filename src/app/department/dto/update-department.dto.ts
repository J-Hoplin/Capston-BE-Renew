import { ApiProperty } from '@nestjs/swagger';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto implements Partial<DepartmentEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    type: String,
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profile?: Express.Multer.File;

  constructor(data: UpdateDepartmentDto) {
    Object.assign(this, data);
  }
}
