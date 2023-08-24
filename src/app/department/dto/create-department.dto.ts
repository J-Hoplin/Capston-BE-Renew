import { ApiProperty } from '@nestjs/swagger';
import { CreateMemberDto } from '@src/app/member/dto/create-member.dto';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateDepartmentDto implements Partial<DepartmentEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({
    type: String,
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profile?: Express.Multer.File;

  constructor(data: CreateMemberDto) {
    Object.assign(this, data);
  }
}
