import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentEntity } from '@src/domain/student/student.entity';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) {}

  public async getStudentById(id: number) {
    const result = await this.studentRepository.findOne({
      where: {
        id,
      },
      relations: {
        department: true,
        classstudent: true,
      },
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }

  public async getStudentByGid(gid: string) {
    const result = await this.studentRepository.findOne({
      where: {
        groupId: gid,
      },
      relations: {
        department: true,
        classstudent: true,
      },
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }
}
