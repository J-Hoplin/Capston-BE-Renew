import { Injectable } from '@nestjs/common';
import { InstructorService } from '../instructor/instructor.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { ImageNotFound } from '@src/infrastructure/exceptions/class-image';
import { CreateImageDto } from './dto/create-image.dto';
import { Logger } from '@hoplin/nestjs-logger';
import { DeleteDepartmentDto } from '../department/dto/delete-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberService } from '../member/member.service';
import { PatchImageStatusDto } from './dto/patch-image-status.dto';
import { v4 } from 'uuid';
import { DeleteImageDto } from './dto/delete-image.dto';

@Injectable()
export class ClassImageService {
  constructor(
    @InjectRepository(ClassImageEntiy)
    private readonly classImageRepository: Repository<ClassImageEntiy>,
    private readonly memberService: MemberService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllClassImages(page: number, pagesize: number) {
    return await this.classImageRepository.find({
      skip: page - 1,
      take: pagesize,
    });
  }

  public async getClassImageById(id: number) {
    const result = await this.classImageRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new ImageNotFound();
    }
    return result;
  }

  public async getClassImageStatus(id: number) {
    const result = await this.classImageRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new ImageNotFound();
    }
    return result.status;
  }

  public async changeStatus(data: PatchImageStatusDto) {
    const { id, status } = data;
    const image = await this.getClassImageById(id);
    if (!image) {
      throw new ImageNotFound();
    }
    const previousStatus = image.status;
    image.status = status;
    await this.classImageRepository.save(image);
    this.logger.log(
      `Image status changed(${image.name}) : ${previousStatus} -> ${status}`,
    );
    return true;
  }

  public async createClassImage(body: CreateImageDto) {
    const { instructor_id } = body;

    // Check instructor exist
    const instructor = await this.memberService.checkApprovedInstructor(
      instructor_id,
    );

    const newImage = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // Get Repository
        const imageRepository = manager.getRepository(ClassImageEntiy);
        // Get instructor
        const instructor = await this.memberService.checkApprovedInstructor(
          body.instructor_id,
        );
        // New class image entity
        const newImage = new ClassImageEntiy({
          name: `${body.name}_${v4()}`,
          instructor: instructor.instructorProfile,
        });

        const saveImage = await imageRepository.save(newImage);
        this.logger.log(`Class image generate requested by ${instructor.id}`);
        return saveImage;
      },
    );

    /**
     *  Make promise function to generate class image with option
     *
     */
    return newImage;
  }

  public async deleteClassImage(body: DeleteImageDto) {
    const { id } = body;
    const findImage = await this.classImageRepository.findOneBy({
      id,
    });
    if (!findImage) {
      throw new ImageNotFound();
    }
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Get Repository
      const imageRepository = manager.getRepository(ClassImageEntiy);

      await imageRepository.remove(findImage);
    });
    return true;
  }
}
