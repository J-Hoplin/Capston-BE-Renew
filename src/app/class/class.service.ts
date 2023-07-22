import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassEntity } from '@src/domain/class/class.entity';
import {
  CantUpdateToLowerBound,
  ClassNotFound,
  StudentCountExceed,
} from '@src/infrastructure/exceptions/class';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { InstructorService } from '../instructor/instructor.service';
import {
  DepartmentNotFound,
  MemberNotFound,
} from '@src/infrastructure/exceptions';
import { ClassImageService } from '../class-image/class-image.service';
import {
  ImageBuildFailed,
  ImageNotFound,
  ImageYetPending,
} from '@src/infrastructure/exceptions/class-image';
import { classImg } from '@src/infrastructure/types';
import { Logger } from '@hoplin/nestjs-logger';
import { MemberService } from '../member/member.service';
import { DepartmentService } from '../department/department.service';
import { UpdateClassDto } from './dto/update-class.dto';
import { DeleteClassDto } from './dto/delete-class.dto';
import { EnrollClassDto } from './dto/enroll-class.dto';
import { ClassStudentEntity } from '@src/domain/class_student/class-student.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly classImageService: ClassImageService,
    private readonly memberService: MemberService,
    private readonly departmentService: DepartmentService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllClass() {
    return await this.classRepository.find();
  }

  public async getClassById(id: number) {
    const result = await this.classRepository.findOne({
      where: {
        id,
      },
      relations: {
        classtudent: true,
      },
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
      relations: {
        classtudent: true,
      },
    });
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

  public async getClassByInstructorAndName(name: string, instructorId: number) {
    const result = await this.classRepository.findOne({
      where: {
        name,
        instructorId,
      },
    });
    if (!result) {
      throw new ClassNotFound();
    }
    return result;
  }

  public async getClassByDepartment(id: number) {
    const department = await this.departmentService.getDepartmentById(
      id,
      false,
    );
    if (!department) {
      throw new DepartmentNotFound();
    }
    const findClasses = await this.classRepository.find({
      where: {
        departmentId: id,
      },
    });
    return findClasses;
  }

  public async getAvailableClasses(id: number) {
    const student = await this.memberService.checkApprovedStudent(id);
    // Filter department
    const filterDepartment = await this.getClassByDepartment(
      student.studentProfile.department.id,
    );
    // Filter only ids
    const filteredClassIds = filterDepartment.map((x) => x.id);
    // Filter student listening
    const filterStudentListening = (
      await this.classRepository.find({
        where: {
          departmentId: student.studentProfile.department.id,
        },
        relations: {
          classtudent: true,
        },
      })
    )
      .map((x) => x.classtudent)
      .flat()
      .map((x) => x.classes);

    // Filter student listening classes from department classes
    const substraction = filteredClassIds.filter(
      (x) => !filterStudentListening.includes(x),
    );
    // Filter from department filtered array
    const result = filterDepartment.filter((x) => substraction.includes(x.id));
    return result;
  }

  public async enrollClass(body: EnrollClassDto) {
    // Check Student is valid
    const student = await this.memberService.checkApprovedStudent(
      body.studentId,
    );
    //Check class exist
    const findClass = await this.getClassById(body.classId);

    // Check class's student count
    const studentCount = findClass.classtudent.length;
    // Exception when exceeded
    if (studentCount + 1 > findClass.maximum_student) {
      throw new StudentCountExceed();
    }
    const newStudentClass = new ClassStudentEntity({
      students: student.groupId,
      classes: findClass.id,
    });
    const result = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const repository = manager.getRepository(ClassStudentEntity);
        await repository.save(newStudentClass);
        return true;
      },
    );
    return true;
  }

  public async createNewClass(body: CreateClassDto) {
    // Check instructor is valid
    const instructor = await this.memberService.checkApprovedInstructor(
      body.instructorId,
    );

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

    console.log(instructor);

    const newClass = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // Get Repository
        const repository = manager.getRepository(ClassEntity);
        // New Class Entity
        const newClass = new ClassEntity(body);
        newClass.departmentId = instructor.instructorProfile.department.id;

        const saveClass = await repository.save(newClass);
        this.logger.log(`New class saved : ${body.name}`);
        return saveClass;
      },
    );
    return newClass;
  }

  public async updateClass(body: UpdateClassDto) {
    const { id, maximum_student } = body;
    // Find class
    const findClass = await this.getClassById(id);
    const studentNow = findClass.classtudent.length;
    // If user tries to update with lower student number compare to enrolled
    if (maximum_student < studentNow) {
      throw new CantUpdateToLowerBound();
    }
    // update
    findClass.maximum_student = maximum_student;

    // save
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const repository = manager.getRepository(ClassEntity);
      await repository.save(findClass);
    });
    return findClass;
  }

  public async deleteClass(body: DeleteClassDto) {
    const { id } = body;
    // Find Class
    const findClass = await this.getClassById(id);
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const repository = manager.getRepository(ClassEntity);
      await repository.delete(findClass);
    });
    return true;
  }
}
