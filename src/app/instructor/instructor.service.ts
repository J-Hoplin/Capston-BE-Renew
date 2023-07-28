import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,
  ) {}

  public async getInstructorById(id: number) {
    const result = await this.instructorRepository.findOne({
      where: {
        id,
      },
      relations: {
        department: true,
        classes: true,
        images: true,
      },
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }
  public async getInstructorByGid(gid: string) {
    const result = await this.instructorRepository.findOne({
      where: {
        groupId: gid,
      },
      relations: {
        department: true,
        classes: true,
        images: true,
      },
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }
}
