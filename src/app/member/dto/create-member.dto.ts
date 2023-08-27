import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '@src/domain/member/member.entity';
import { member } from '@src/infrastructure/types';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMemberDto implements Partial<MemberEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupId!: string;

  @ApiProperty({
    enum: member.Sex,
  })
  @IsNotEmpty()
  @IsEnum(member.Sex)
  sex!: member.Sex;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  birth!: Date;

  @ApiProperty({
    enum: member.Role,
  })
  @IsNotEmpty()
  @IsEnum(member.Role)
  memberRole!: member.Role;

  @ApiProperty({
    required: false,
    description: '학생 혹은 교직원 가입의 경우에는 필수입니다.',
  })
  @IsOptional()
  departmentId: number;

  @ApiProperty({
    type: String,
    format: 'binary',
    required: false,
  })
  profile?: Express.Multer.File;

  constructor(data: CreateMemberDto) {
    Object.assign(this, data);
  }
}
