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
} from '@nestjs/common';
import { ClassImageService } from './class-image.service';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { CommonResponseDto } from '@src/infrastructure/common/common.response.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CLASS_IMAGE_EXCEPTION_MSG } from '@src/infrastructure/exceptions/class-image';
import { CreateImageDto } from './dto/create-image.dto';
import { MEMBER_EXCEPTION_MSG } from '@src/infrastructure/exceptions';
import { DeleteDepartmentDto } from '../department/dto/delete-department.dto';
import { PatchImageStatusDto } from './dto/patch-image-status.dto';

@ApiTags('Class-Image')
@Controller('class-image')
export class ClassImageController {
  constructor(private readonly classImageService: ClassImageService) {}

  @Get()
  @ApiOperation({
    summary: '모든 수업환경 컨테이너 이미지를 조회합니다.',
  })
  @ApiOkResponse({
    type: ClassImageEntiy,
    isArray: true,
  })
  public async getAllClassImages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pagesize', new DefaultValuePipe(10), ParseIntPipe) pagesize: number,
  ) {
    return await this.classImageService.getAllClassImages(page, pagesize);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID를 통해 수업환경 컨테이너 이미지를 조회합니다.',
  })
  @ApiOkResponse({ type: ClassImageEntiy })
  @ApiBadRequestResponse({
    description: CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
  })
  public async getClassImageById(@Param('id') id: number) {
    return await this.classImageService.getClassImageById(id);
  }

  @Get('/status/:id')
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
  })
  @ApiOperation({
    summary: 'ID를 통해 컨테이너의 상태를 조회합니다.',
  })
  public async getClassImageStatus(@Param('id') id: number) {
    const result = await this.classImageService.getClassImageStatus(id);
    return new CommonResponseDto(result);
  }

  @Patch()
  @ApiOperation({
    summary:
      'Class Image status를 변경합니다. Production Level에서는 사용이 불가능하며, 테스트 용도입니다',
  })
  @ApiOkResponse({
    type: CommonResponseDto,
  })
  @ApiBadRequestResponse({
    description: CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
  })
  public async changeStatus(@Body() data: PatchImageStatusDto) {
    const result = await this.classImageService.changeStatus(data);
    return new CommonResponseDto(result);
  }

  @Post()
  @ApiOperation({
    summary: '새로운 컨테이너를 생성합니다.',
  })
  @ApiOkResponse({ type: ClassImageEntiy })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async createClassImage(@Body() body: CreateImageDto) {
    return await this.classImageService.createClassImage(body);
  }

  @Delete()
  @ApiOperation({
    summary: '컨테이너 이미지를 삭제합니다.',
  })
  @ApiBadRequestResponse({
    description: CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound,
  })
  @ApiOkResponse({ type: CommonResponseDto })
  public async deleteClassImage(@Body() body: DeleteDepartmentDto) {
    const result = await this.classImageService.deleteClassImage(body);
    return new CommonResponseDto(result);
  }
}
