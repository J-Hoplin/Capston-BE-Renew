import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AUTH_EXCEPTION_MSG,
  DEPARTMENT_EXCEPTION_MSG,
  MEMBER_EXCEPTION_MSG,
  MemberNotFound,
} from '@infrastructure/exceptions';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { UpdateMemberApprovalDto } from './dto/updateMemberApproval.dto';
import { CommonResponseDto } from '@src/infrastructure/common/common.response.dto';

@ApiTags('Member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('/')
  @ApiOperation({
    summary: '모든 회원의 정보를 가져옵니다.',
  })
  @ApiOkResponse({
    type: MemberEntity,
    isArray: true,
  })
  @ApiQuery({
    name: 'detail',
    required: false,
    description: '학생 및 교직원의 세부정보를 불러오는지의 여부입니다.',
  })
  public async getAllMembers(
    @Query('detail', new DefaultValuePipe(false), ParseBoolPipe) detail,
  ): Promise<MemberEntity[]> {
    return await this.memberService.getAllMembers(detail);
  }

  @Get('/id/:id')
  @ApiOperation({
    summary: '회원 정보를 id를 통해 조회합니다.',
  })
  @ApiOkResponse({
    type: MemberEntity,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getMemberById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MemberEntity> {
    return await this.memberService.getMemberById(id);
  }

  @Get('/gid/:groupId')
  @ApiOperation({
    summary: '회원 정보를 Group ID를 통해 조회합니다',
    description: 'Group ID는 학생, 교직원의 고유 ID를 의미합니다',
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getMemberByGroupId(
    @Param('groupId') groupId: string,
  ): Promise<MemberEntity> {
    return await this.memberService.getMemberByGroupId(groupId);
  }

  @Post()
  @ApiOperation({
    summary: '새로운 회원을 가입시킵니다.',
    description: '비밀번호는 Bcrypt를 사용해 단방향 암호화합니다',
  })
  @ApiBadRequestResponse({
    description: DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound,
  })
  public async createMember(
    @Body() body: CreateMemberDto,
  ): Promise<MemberEntity> {
    return await this.memberService.createMember(body);
  }

  @Patch()
  @ApiOperation({
    summary: '회원 정보를 수정합니다',
    description:
      '이름, 비밀번호, 생일 정보만 변경 가능합니다. 회원정보 변경을 위해서는 비밀번호 입력이 필수입니다.',
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_EXCEPTION_MSG.PasswordUnmatched,
  })
  public async updateMember(
    @Body() body: UpdateMemberDto,
  ): Promise<MemberEntity> {
    return await this.memberService.updateMember(body);
  }

  @Get('/approval/:id')
  @ApiOperation({
    summary: '회원 계정 상태를 조회합니다',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getMemberApproval(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommonResponseDto> {
    return new CommonResponseDto(this.memberService.getMemberApproval(id));
  }

  @Patch('/approval')
  @ApiOperation({
    summary: '회원 계정 상태를 변경합니다',
    description:
      '상태 변경시, 변경 사유를 필수로 입력해야합니다. ex) 계정 정지시 정지사유',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async updateMemberApproval(
    @Body() body: UpdateMemberApprovalDto,
  ): Promise<CommonResponseDto> {
    return new CommonResponseDto(this.memberService.updateMemberApproval(body));
  }

  @Delete()
  @ApiOperation({
    summary: '회원을 탈퇴합니다',
    description: '탈퇴시 비밀번호 확인이 진행됩니다.',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_EXCEPTION_MSG.PasswordUnmatched,
  })
  public async deleteMember(body: DeleteMemberDto): Promise<CommonResponseDto> {
    return new CommonResponseDto(this.memberService.deleteMember(body));
  }
}