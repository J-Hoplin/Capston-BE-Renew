import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '@src/domain/member/member.entity';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateMemberDto implements Partial<MemberEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number; // Will be deleted after auth API generated

  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  changedpassword?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  originalpassword!: string;

  @ApiProperty()
  @IsString()
  birth?: Date;

  constructor(data: UpdateMemberDto) {
    Object.assign(this, data);
  }
}
