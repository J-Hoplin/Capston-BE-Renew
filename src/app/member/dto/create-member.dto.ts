import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '@src/domain/member/member.entity';
import { member } from '@src/infrastructure/types';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
  @IsDate()
  birth!: Date;

  @ApiProperty({
    enum: member.Role,
  })
  @IsNotEmpty()
  @IsEnum(member.Role)
  memberRole!: member.Role;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  departmentId: number;

  constructor(data: CreateMemberDto) {
    Object.assign(this, data);
  }
}
