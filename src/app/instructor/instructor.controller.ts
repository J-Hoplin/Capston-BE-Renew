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
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';

@ApiTags('Instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('/:id')
  @ApiOperation({
    description: 'Instructor를 ID를 통해 조회합니다.',
  })
  @ApiOkResponse({ type: InstructorEntity })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getInstructorById(@Param('id', ParseIntPipe) id: number) {
    return await this.instructorService.getInstructorById(id);
  }

  @Get('/gid/:gid')
  @ApiOperation({
    description: 'Instructor를 Group ID를 통해 조회합니다',
  })
  @ApiOkResponse({ type: InstructorEntity })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async getInstructorByGroupId(@Param('gid') id: string) {
    return await this.instructorService.getInstructorByGid(id);
  }
}
