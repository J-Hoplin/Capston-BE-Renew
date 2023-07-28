import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassEntity } from '@src/domain/class/class.entity';
import {
  CantUpdateToLowerBound,
  ClassNotFound,
  DuplicatedClassNameFound,
  StudentCountExceed,
  StudentCountShouldBeUpperThanZero,
  UnavailableToEnroll,
} from '@src/infrastructure/exceptions/class';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { InstructorService } from '../instructor/instructor.service';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { ClassImageService } from '../class-image/class-image.service';
import {
  ImageBuildFailed,
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
import { WithdrawClassDto } from './dto/withdraw-class.dto';
import { MemberEntity } from '@src/domain/member/member.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly classImageService: ClassImageService,
    private readonly memberService: MemberService,
    private readonly departmentService: DepartmentService,
    private readonly instructorService: InstructorService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllClass(page: number, pagesize: number) {
    return await this.classRepository.find({
      skip: page - 1,
      take: pagesize,
    });
  }

  public async getClassById(id: number) {
    const result = await this.classRepository.findOne({
      where: {
        id,
      },
      relations: {
        instructor: true,
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
    // Check instructor exist
    await this.instructorService.getInstructorById(id);
    const result = await this.classRepository.find({
      where: {
        instructor: {
          id,
        },
      },
    });
    return result;
  }

  public async getClassByInstructorAndName(name: string, instructorId: number) {
    // Check instructor exist
    await this.instructorService.getInstructorById(instructorId);
    const result = await this.classRepository.findOne({
      where: {
        name,
        instructor: {
          id: instructorId,
        },
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
    const findClasses = await this.classRepository.find({
      where: {
        departmentId: id,
      },
    });
    return findClasses;
  }

  public async getAvailableClasses(student: MemberEntity) {
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
          classtudent: {
            students: true,
            classes: true,
          },
        },
      })
    )
      .map((x) => x.classtudent) // Map class - student entity
      .flat()
      .filter((x) => x.students.id === student.id) // filter only student
      .map((x) => x.classes.id); // return class ids

    // Filter student listening classes from department classes
    const substraction = filteredClassIds.filter(
      (x) => !filterStudentListening.includes(x),
    );
    // Filter from department filtered array
    const result = filterDepartment.filter((x) => substraction.includes(x.id));
    return result;
  }

  public async enrollClass(body: EnrollClassDto, student: MemberEntity) {
    //Check class exist
    const findClass = await this.getClassById(body.classId);
    // Check if it's available class
    const checkAvailableClass = (await this.getAvailableClasses(student))
      .map((x) => x.id)
      .some((x) => x === body.classId);

    if (!checkAvailableClass) {
      throw new UnavailableToEnroll();
    }
    // Check class's student count
    const studentCount = findClass.classtudent.length;
    // Exception when exceeded
    if (studentCount + 1 > findClass.maximum_student) {
      throw new StudentCountExceed();
    }
    const newStudentClass = new ClassStudentEntity({
      students: student.studentProfile,
      classes: findClass,
    });
    const result = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const repository = manager.getRepository(ClassStudentEntity);
        await repository.save(newStudentClass);
        return true;
      },
    );
    this.logger.log(
      `Student ${student.groupId}(${student.name}) enroll new class : `,
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
    // If image status is not pending
    if (envImage.status !== classImg.status.SUCCESS) {
      switch (envImage.status) {
        case classImg.status.PENDING:
          throw new ImageYetPending();
        default:
          throw new ImageBuildFailed();
      }
    }
    // Check instructor already enrolled class with same name
    const instructorClasses = (
      await this.getClassByInstructor(body.instructorId)
    ).map((x) => {
      return x.name;
    });
    if (instructorClasses.includes(body.name)) {
      throw new DuplicatedClassNameFound();
    }

    // Check maximum student count
    if (body.maximum_student <= 0) {
      throw new StudentCountShouldBeUpperThanZero();
    }
    const newClass = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // Get Repository
        const repository = manager.getRepository(ClassEntity);
        // New Class Entity
        const newClass = new ClassEntity(body);

        newClass.departmentId = instructor.instructorProfile.department.id;
        newClass.instructor = instructor.instructorProfile;
        newClass.class_image = envImage;

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
    this.logger.log(
      `Class info updated : ${findClass.name}(Instructor ID : ${findClass.instructor.id})`,
    );
    return findClass;
  }

  public async deleteClass(body: DeleteClassDto) {
    const { id } = body;
    // Find Class
    const findClass = await this.getClassById(id);
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const repository = manager.getRepository(ClassEntity);
      await repository.remove(findClass);
    });
    this.logger.log(
      `Class removed : ${findClass.name}(Instructor ID : ${findClass.instructor.id})`,
    );
    return true;
  }

  public async withdrawClass(body: WithdrawClassDto) {
    const { classId, studentId } = body;
    const result = await this.classRepository.findOne({
      where: {
        id: classId,
      },
      relations: {
        classtudent: {
          students: true,
        },
      },
    });
    if (!result) {
      throw new ClassNotFound();
    }
    const findMember = result.classtudent.filter(
      (x) => x.students.id === studentId,
    );
    if (!findMember.length) {
      throw new MemberNotFound();
    }
    result.classtudent = result.classtudent.filter(
      (x) => x.students.id !== studentId,
    );
    const save = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const repository = manager.getRepository(ClassEntity);
        await repository.save(result);
        return true;
      },
    );
    return save;
  }
}
