import { MemberEntity } from '@src/domain/member/member.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { member } from '@src/infrastructure/types';

export class UpdateMemberApprovalDto implements Partial<MemberEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number;

  @ApiProperty({
    enum: member.Approve,
  })
  @IsNotEmpty()
  @IsEnum(member.Approve)
  approved!: member.Approve;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  approvedReason!: string;
}
