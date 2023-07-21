import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { MEMBER_EXCEPTION_MSG } from '@src/infrastructure/exceptions';
import { ClassEntity } from '@src/domain/class/class.entity';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';

@ApiTags('Instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('/:id/department')
  @ApiOperation({
    summary: '교직원의 소속 부서를 조회합니다. Id는 group id이어야 합니다',
  })
  @ApiOkResponse({ type: DepartmentEntity })
  @ApiBadRequestResponse({ type: MEMBER_EXCEPTION_MSG.MemberNotFound })
  public async getInstructorDepartment(@Param('id', ParseIntPipe) id: number) {
    return await this.instructorService.getInstructorDepartment(id);
  }
}
