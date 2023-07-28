import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateClassDto } from './dto/create-class.dto';
import { ClassEntity } from '@src/domain/class/class.entity';
import { CLASS_EXCEPTION_MSG } from '@src/infrastructure/exceptions/class';
import {
  AUTH_EXCEPTION_MSG,
  DEPARTMENT_EXCEPTION_MSG,
  MEMBER_EXCEPTION_MSG,
} from '@src/infrastructure/exceptions';
import { CLASS_IMAGE_EXCEPTION_MSG } from '@src/infrastructure/exceptions/class-image';
import { UpdateClassDto } from './dto/update-class.dto';
import { DeleteClassDto } from './dto/delete-class.dto';
import { CommonResponseDto } from '@src/infrastructure/common/common.response.dto';
import { EnrollClassDto } from './dto/enroll-class.dto';
import { WithdrawClassDto } from './dto/withdraw-class.dto';
import { JwtGuard } from '../authentication/jwt.guard';
import { AllowedMember } from '../authorization/allowed.guard';
import { Roles } from '../authorization/role.decorator';
import { member } from '@src/infrastructure/types';
import { Member } from '../authentication/Member.decorator';
import { MemberEntity } from '@src/domain/member/member.entity';

@ApiTags('Class')
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @ApiOperation({
    summary: '모든 수업 목록을 조회합니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getAllClass(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pagesize', new DefaultValuePipe(10), ParseIntPipe) pagesize: number,
  ) {
    return await this.classService.getAllClass(page, pagesize);
  }

  @Get('/id/:id')
  @ApiOperation({
    summary: 'ID를 통해 수업을 조회합니다',
  })
  @ApiOkResponse({
    type: ClassEntity,
  })
  @ApiBadRequestResponse({
    description: CLASS_EXCEPTION_MSG.ClassNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getClassById(@Param('id', ParseIntPipe) id: number) {
    return await this.classService.getClassById(id);
  }

  @Get('/name/:name')
  @ApiOperation({
    summary: '동일한 이름의 수업들을 가져옵니다',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: CLASS_EXCEPTION_MSG.ClassNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getClassByName(@Param('name') name: string) {
    return await this.classService.getClassByName(name);
  }

  @Get('/instructor/:id')
  @ApiOperation({
    summary: '강사의 수업들을 나열합니다. 강사의 ID(Member.id)가 요구됩니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: CLASS_EXCEPTION_MSG.ClassNotFound,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getClassByInstructor(@Param('id', ParseIntPipe) id: number) {
    return await this.classService.getClassByInstructor(id);
  }

  @Get('/name/:name/instructor/:id')
  @ApiOperation({
    summary: '강사와 수업 이름을 통해 검색합니다',
  })
  @ApiBadRequestResponse({
    description: [CLASS_EXCEPTION_MSG.ClassNotFound].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getClassByInstructorAndName(
    @Param('name') name: string,
    @Param('id', ParseIntPipe) instructorId: number,
  ) {
    return await this.classService.getClassByInstructorAndName(
      name,
      instructorId,
    );
  }

  @Get('/department/:id')
  @ApiOperation({
    summary: '부서 담당 수업을 검색합니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: [DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  public async getClassByDepartment(@Param('id') id: number) {
    return await this.classService.getClassByDepartment(id);
  }

  @Get('/available/:id')
  @ApiOperation({
    summary: '학생이 수강 가능한 수업 목록들을 불러옵니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: [MEMBER_EXCEPTION_MSG.MemberNotFound].join(', '),
  })
  @ApiUnauthorizedResponse({
    description: [AUTH_EXCEPTION_MSG.InvalidMemberApproval].join(', '),
  })
  @ApiUnprocessableEntityResponse({
    description: [AUTH_EXCEPTION_MSG.EmailYetConfirmed].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.STUDENT)
  public async getAvailableClasses(@Member() student: MemberEntity) {
    return await this.classService.getAvailableClasses(student);
  }

  @Post()
  @ApiOperation({
    summary: '수업을 생성합니다',
  })
  @ApiOkResponse({
    type: ClassEntity,
  })
  @ApiBadRequestResponse({
    description: [
      MEMBER_EXCEPTION_MSG.MemberNotFound,
      CLASS_EXCEPTION_MSG.DuplicatedClassNameFound,
      CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
      CLASS_EXCEPTION_MSG.StudentCountShouldBeUpperThanZero,
    ].join(', '),
  })
  @ApiUnauthorizedResponse({
    description: [AUTH_EXCEPTION_MSG.InvalidMemberApproval].join(', '),
  })
  @ApiUnprocessableEntityResponse({
    description: [
      CLASS_IMAGE_EXCEPTION_MSG.ImageYetPending,
      CLASS_IMAGE_EXCEPTION_MSG.ImageBuildFailed,
      AUTH_EXCEPTION_MSG.EmailYetConfirmed,
    ].join(','),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.MANAGER, member.Role.INSTRUCTOR)
  public async createNewClass(@Body() body: CreateClassDto) {
    return await this.classService.createNewClass(body);
  }

  @Post('/enroll')
  @ApiOperation({
    summary: '학생이 수업을 등록합니다.',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: [
      MEMBER_EXCEPTION_MSG.MemberNotFound,
      CLASS_EXCEPTION_MSG.ClassNotFound,
      CLASS_EXCEPTION_MSG.StudentCountExceed,
      CLASS_EXCEPTION_MSG.UnavailableToEnroll,
    ].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.STUDENT)
  public async enrollClass(
    @Body() body: EnrollClassDto,
    @Member() student: MemberEntity,
  ) {
    const result = await this.classService.enrollClass(body, student);
    return new CommonResponseDto(result);
  }

  @Patch()
  @ApiOperation({
    summary: '수업 정보를 수정합니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
  })
  @ApiBadRequestResponse({
    description: [
      CLASS_EXCEPTION_MSG.ClassNotFound,
      CLASS_EXCEPTION_MSG.CantUpdateToLowerBound,
    ].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.INSTRUCTOR, member.Role.MANAGER)
  public async updateClass(@Body() body: UpdateClassDto) {
    return await this.classService.updateClass(body);
  }

  @Delete()
  @ApiOperation({
    summary: '수업을 삭제합니다.',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: [CLASS_EXCEPTION_MSG.ClassNotFound].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.INSTRUCTOR, member.Role.MANAGER)
  public async deleteClass(@Body() body: DeleteClassDto) {
    const result = await this.classService.deleteClass(body);
    return new CommonResponseDto(result);
  }

  @Delete('/withdraw')
  @ApiOperation({
    summary: '수업에서 탈퇴합니다',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: [
      CLASS_EXCEPTION_MSG.ClassNotFound,
      MEMBER_EXCEPTION_MSG.MemberNotFound,
    ].join(', '),
  })
  @ApiBearerAuth()
  @UseGuards(AllowedMember)
  @UseGuards(JwtGuard)
  @Roles(member.Role.STUDENT)
  public async withdrawClass(@Body() body: WithdrawClassDto) {
    const result = await this.classService.withdrawClass(body);
    return new CommonResponseDto(result);
  }
}
