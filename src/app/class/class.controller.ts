import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ClassService } from './class.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateClassDto } from './dto/create-class.dto';
import { ClassEntity } from '@src/domain/class/class.entity';
import { CLASS_EXCEPTION_MSG } from '@src/infrastructure/exceptions/class';
import { MEMBER_EXCEPTION_MSG } from '@src/infrastructure/exceptions';
import { CLASS_IMAGE_EXCEPTION_MSG } from '@src/infrastructure/exceptions/class-image';

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
  public async getAllClass() {
    return await this.classService.getAllClass();
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
  public async getClassByName(@Param('name') name: string) {
    return await this.classService.getClassByName(name);
  }

  @Get('/name/:name/division/:division')
  @ApiOperation({
    summary: '이름과 분반을 통해 조회합니다.',
  })
  @ApiOkResponse({
    type: ClassEntity,
  })
  @ApiBadRequestResponse({
    description: CLASS_EXCEPTION_MSG.ClassNotFound,
  })
  public async getClassByNameAndDivision(
    @Param('name') name: string,
    @Param('division', ParseIntPipe) division: number,
  ) {
    return await this.classService.getClassByNameAndDivision(name, division);
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
  public async getClassByInstructor(@Param('id', ParseIntPipe) id: number) {
    return await this.getClassByInstructor(id);
  }

  @Post()
  @ApiOperation({
    summary: '수업을 생성합니다',
  })
  @ApiOkResponse({
    type: ClassEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: [
      MEMBER_EXCEPTION_MSG.MemberNotFound,
      CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
    ].join(', '),
  })
  @ApiUnprocessableEntityResponse({
    description: [
      CLASS_IMAGE_EXCEPTION_MSG.ImageYetPending,
      CLASS_IMAGE_EXCEPTION_MSG.ImageBuildFailed,
    ].join(','),
  })
  public async createNewClass(@Body() body: CreateClassDto) {
    return await this.classService.createNewClass(body);
  }

  @Patch()
  public async updateClass() {
    return await this.classService.updateClass();
  }

  @Delete()
  public async deleteClass() {
    return await this.classService.deleteClass();
  }
}
