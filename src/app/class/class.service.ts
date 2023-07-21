import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassEntity } from '@src/domain/class/class.entity';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { ClassNotFound } from '@src/infrastructure/exceptions/class';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { InstructorService } from '../instructor/instructor.service';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { ClassImageService } from '../class-image/class-image.service';
import {
  ImageBuildFailed,
  ImageNotFound,
  ImageYetPending,
} from '@src/infrastructure/exceptions/class-image';
import { classImg } from '@src/infrastructure/types';
import { Logger } from '@hoplin/nestjs-logger';
import { MemberService } from '../member/member.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly classImageService: ClassImageService,
    private readonly memberService: MemberService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllClass() {
    return await this.classRepository.find();
  }

  public async getClassById(id: number) {
    const result = await this.classRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new ClassNotFound();
    }
    return result;
  }

  public async getClassByName(name: string) {
    const result = await this.classRepository.find({
      where: {
        name,
      },
    });
    if (!result.length) {
      throw new ClassNotFound();
    }
    return result;
  }

  public async getClassByNameAndDivision(name: string, division: number) {
    const result = await this.classRepository.findOneBy({
      name,
      divisionNumber: division,
    });
    if (!result) {
      throw new ClassNotFound();
    }
    return result;
  }

  public async getClassByInstructor(id: number) {
    const result = await this.classRepository.find({
      where: {
        id,
      },
    });
    if (!result.length) {
      throw new ClassNotFound();
    }
    return result;
  }

  public async createNewClass(body: CreateClassDto) {
    // Check instructor exist
    const instructor = await this.memberService.checkApprovedInstructor(
      body.instructorId,
    );
    // If not exist, raise error
    if (!instructor) {
      throw new MemberNotFound();
    }
    // Check image exist
    const envImage = await this.classImageService.getClassImageById(
      body.classImageId,
    );
    if (!envImage) {
      throw new ImageNotFound();
    } else {
      // If image status is not pending
      if (envImage.status !== classImg.status.SUCCESS) {
        switch (envImage.status) {
          case classImg.status.PENDING:
            throw new ImageYetPending();
          default:
            throw new ImageBuildFailed();
        }
      }
    }
    const newClass = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // Get Repository
        const repository = manager.getRepository(ClassEntity);
        // New Class Entity
        const newClass = new ClassEntity(body);

        const saveClass = await repository.save(newClass);
        this.logger.log(
          `New class saved : ${body.name} - ${body.divisionNumber}`,
        );
        return saveClass;
      },
    );
    return newClass;
  }

  public async updateClass() {}

  public async deleteClass() {}
}
