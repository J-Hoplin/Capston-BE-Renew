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

@Injectable()
export class ClassImageService {
  constructor(
    @InjectRepository(ClassImageEntiy)
    private readonly classImageRepository: Repository<ClassImageEntiy>,
    private readonly memberService: MemberService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllClassImages() {
    return await this.classImageRepository.find();
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
        // New class image entity
        const newImage = new ClassImageEntiy({
          name: body.name,
          instructor_id: body.instructor_id,
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

  public async deleteClassImage(body: DeleteDepartmentDto) {
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

      await imageRepository.delete(findImage);
    });
    return true;
  }
}
