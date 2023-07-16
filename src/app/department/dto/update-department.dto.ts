import { ApiProperty } from '@nestjs/swagger';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto implements Partial<DepartmentEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
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
