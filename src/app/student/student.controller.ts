import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { StudentEntity } from '@src/domain/student/student.entity';
import { MEMBER_EXCEPTION_MSG } from '@src/infrastructure/exceptions';

@ApiTags('Student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('/:id')
  @ApiOperation({
    description: 'Student를 ID를 통해 검색합니다',
  })
  @ApiOkResponse({ type: StudentEntity })
  @ApiBadRequestResponse({ description: MEMBER_EXCEPTION_MSG.MemberNotFound })
  public async getStudentById(@Param('id', ParseIntPipe) id: number) {
    return await this.studentService.getStudentById(id);
  }

  @Get('/gid/:gid')
  @ApiOkResponse({ type: StudentEntity })
  @ApiBadRequestResponse({ description: MEMBER_EXCEPTION_MSG.MemberNotFound })
  public async getStudentByGid(@Param('gid') gid: string) {
    return await this.studentService.getStudentByGid(gid);
  }
}
