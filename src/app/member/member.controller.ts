import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { imageLocalDiskOption } from '@src/infrastructure/multer';
import { join } from 'path';
import { JwtGuard } from '../authentication/jwt.guard';
import { Member } from '../authentication/Member.decorator';
import { AllowedMember } from '../authorization/allowed.guard';
import { Roles } from '../authorization/role.decorator';
import { member } from '@src/infrastructure/types';
import { CheckType, CheckTypeValidationPipe } from './member.enum';

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
  public async getAllMembers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pagesize', new DefaultValuePipe(10), ParseIntPipe) pagesize: number,
  ): Promise<MemberEntity[]> {
    return await this.memberService.getAllMembers(page, pagesize);
  }

  @Get('/id/:id')
  @ApiOperation({
    summary: '회원 정보를 id를 통해 조회합니다. 로그인이 요구됩니다.',
  })
  @ApiOkResponse({
    type: MemberEntity,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getMemberById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MemberEntity> {
    return await this.memberService.getMemberById(id);
  }

  @Get('/gid/:groupId')
  @ApiOperation({
    summary: '회원 정보를 Group ID를 통해 조회합니다. 로그인이 요구됩니다.',
    description: 'Group ID는 학생, 교직원의 고유 ID를 의미합니다',
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getMemberByGroupId(
    @Param('groupId') groupId: string,
  ): Promise<MemberEntity> {
    return await this.memberService.getMemberByGroupId(groupId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'profile',
      imageLocalDiskOption(`${__dirname}/../../../profiles`),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '회원가입을 진행합니다.',
    description: '비밀번호는 Bcrypt를 사용해 단방향 암호화합니다',
  })
  @ApiOkResponse({ type: MemberEntity })
  @ApiUnprocessableEntityResponse({
    description: new UnprocessableEntityException().message,
  })
  @ApiBadRequestResponse({
    description: [
      DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound,
      MEMBER_EXCEPTION_MSG.GroupIDAlreadyTaken,
      MEMBER_EXCEPTION_MSG.DepartmentIdNotGiven,
    ].join(', '),
  })
  public async createMember(
    @Body() body: CreateMemberDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpg|png)$',
        })
        .addMaxSizeValidator({ maxSize: 1000000 })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    profileImage?: Express.Multer.File,
  ): Promise<MemberEntity> {
    return await this.memberService.createMember(body, profileImage);
  }

  @Patch()
  @ApiOperation({
    summary: '회원 정보를 수정합니다. 로그인이 요구됩니다.',
    description:
      '이름, 비밀번호, 생일 정보만 변경 가능합니다. 회원정보 변경을 위해서는 비밀번호 입력이 필수입니다.',
  })
  @UseInterceptors(
    FileInterceptor(
      'profile',
      imageLocalDiskOption(`${__dirname}/../../../profiles`),
    ),
  )
  @ApiOkResponse({ type: MemberEntity })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_EXCEPTION_MSG.PasswordUnmatched,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async updateMember(
    @Body() body: UpdateMemberDto,
    @Member() member: MemberEntity,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpg|png)$',
        })
        .addMaxSizeValidator({ maxSize: 1000000 })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: Express.Multer.File,
  ): Promise<MemberEntity> {
    return await this.memberService.updateMember(body, member, file);
  }

  @Get('/check/:type/:value')
  @ApiOperation({
    summary: '회원 정보값의 중복값이 있는지 확인합니다',
    description: "type의 값은 'email' 혹은 'gid'가 되어야 합니다.",
  })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.UnsupportedCheckType,
  })
  public async checkValueIsAvailable(
    @Param('type', CheckTypeValidationPipe) tp: CheckType,
    @Param('value') val: string,
  ) {
    const result = new CommonResponseDto(
      await this.memberService.checkValueIsAvailable(tp, val),
    );
    return result;
  }

  @Get('/approval/:id')
  @ApiOperation({
    summary: '회원 계정 상태를 조회합니다',
  })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getMemberApproval(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommonResponseDto> {
    return new CommonResponseDto(
      await this.memberService.getMemberApproval(id),
    );
  }

  @Patch('/approval')
  @ApiOperation({
    summary: '회원 계정 상태를 변경합니다. Manager 권한이 요구됩니다.',
    description:
      '상태 변경시, 변경 사유를 필수로 입력해야합니다. ex) 계정 정지시 정지사유',
  })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.MANAGER)
  public async updateMemberApproval(
    @Body() body: UpdateMemberApprovalDto,
  ): Promise<CommonResponseDto> {
    return new CommonResponseDto(
      await this.memberService.updateMemberApproval(body),
    );
  }

  @Delete()
  @ApiOperation({
    summary: '회원을 탈퇴합니다. 로그인이 요구됩니다.',
    description: '탈퇴시 비밀번호 확인이 진행됩니다.',
  })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_EXCEPTION_MSG.PasswordUnmatched,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async deleteMember(
    @Body() body: DeleteMemberDto,
    @Member() member: MemberEntity,
  ): Promise<CommonResponseDto> {
    return new CommonResponseDto(
      await this.memberService.deleteMember(body, member),
    );
  }
}
