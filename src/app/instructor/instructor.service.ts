import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { ClassEntity } from '@src/domain/class/class.entity';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { Repository } from 'typeorm';
import { DepartmentService } from '../department/department.service';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,
    private readonly departmentService: DepartmentService,
  ) {}

  public async getInstructorDepartment(id: number): Promise<DepartmentEntity> {
    const result = await this.instructorRepository.findOne({
      where: {
        id,
      },
    });
    if (!result) {
      throw new MemberNotFound();
    }
    const findDepartment = await this.departmentService.getDepartmentById(
      result.department.id,
      false,
    );
    return findDepartment;
  }

  public async getInstructorById(id: number) {
    const result = await this.instructorRepository.findOne({
      where: {
        id,
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
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }
}
