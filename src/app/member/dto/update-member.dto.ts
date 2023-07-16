import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '@src/domain/member/member.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto implements Partial<MemberEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number; // Will be deleted after auth API generated

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  changedpassword?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  originalpassword!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birth?: Date;

  @ApiProperty({
    type: String,
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profile?: Express.Multer.File;

  constructor(data: UpdateMemberDto) {
    Object.assign(this, data);
  }
}
