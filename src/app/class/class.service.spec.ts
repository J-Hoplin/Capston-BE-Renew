import { Test, TestingModule } from '@nestjs/testing';
import { ClassService } from './class.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource, Repository } from 'typeorm';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ClassEntity } from '@src/domain/class/class.entity';
import { ClassImageModule } from '../class-image/class-image.module';
import { MemberModule } from '../member/member.module';
import { DepartmentModule } from '../department/department.module';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  exampleDepartmentEntity,
  exampleDepartmentEntity2,
  exampleDepartmentEntity3,
  exampleInstructorEntity,
  exampleInstructorEntity2,
  exampleStudent1Entity,
  exampleStudent2Entity,
  exampleStudent3Entity,
} from './test';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { StudentEntity } from '@src/domain/student/student.entity';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { MemberService } from '../member/member.service';
import { DepartmentService } from '../department/department.service';
import { ClassImageService } from '../class-image/class-image.service';
import defaultConfig from '@src/config/config/default.config';
import { CreateClassDto } from './dto/create-class.dto';
import { status } from '@src/infrastructure/types/class-image';
import {
  ImageBuildFailed,
  ImageYetPending,
} from '@src/infrastructure/exceptions/class-image';
import {
  DepartmentNotFound,
  EmailYetConfirmed,
  InvalidMemberApproval,
  MemberNotFound,
} from '@src/infrastructure/exceptions';
import { member } from '@src/infrastructure/types';
import {
  CantUpdateToLowerBound,
  ClassNotFound,
  DuplicatedClassNameFound,
  UnavailableToEnroll,
} from '@src/infrastructure/exceptions/class';
import { InstructorService } from '../instructor/instructor.service';
import { EnrollClassDto } from './dto/enroll-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { DeleteClassDto } from './dto/delete-class.dto';
import { WithdrawClassDto } from './dto/withdraw-class.dto';

describe('ClassService', () => {
  jest.setTimeout(3000000);
  let service: ClassService;

  // Database Container
  let container: StartedMySqlContainer;
  // Datasource
  let dataSource: DataSource;

  /**
   * Example Entities
   */

  let department: DepartmentEntity;
  let department2: DepartmentEntity;
  let department3: DepartmentEntity;
  let instructor: MemberEntity;
  let instructor2: MemberEntity;
  let student1: MemberEntity;
  let student2: MemberEntity;
  let student3: MemberEntity;
  let classInfo: ClassEntity;
  let classInfo2: ClassEntity;
  let classInfo3: ClassEntity;
  let classImage: ClassImageEntiy;

  /**
   * Example repository
   */
  let departmentRepository: Repository<DepartmentEntity>;
  let memberRepository: Repository<MemberEntity>;
  let classImageRepository: Repository<ClassImageEntiy>;
  let classRepository: Repository<ClassEntity>;

  let exmapleClass: CreateClassDto;

  beforeAll(async () => {
    container = await new MySqlContainer().start();
    dataSource = await new DataSource({
      type: 'mysql',
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getUserPassword(),
      synchronize: true,
      entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
    }).initialize();

    // Create mocked department, student, instructor
    departmentRepository = dataSource.getRepository(DepartmentEntity);
    memberRepository = dataSource.getRepository(MemberEntity);
    classImageRepository = dataSource.getRepository(ClassImageEntiy);
    classRepository = dataSource.getRepository(ClassEntity);

    department = await departmentRepository.save(exampleDepartmentEntity);
    department2 = await departmentRepository.save(exampleDepartmentEntity2);
    department3 = await departmentRepository.save(exampleDepartmentEntity3);

    // Department : DSC
    instructor = await memberRepository.save(exampleInstructorEntity);
    instructor.instructorProfile = new InstructorEntity({
      id: instructor.id,
      groupId: exampleInstructorEntity.groupId,
      department: department,
    });
    instructor = await memberRepository.save(instructor);

    // Department : Game SW
    instructor2 = await memberRepository.save(exampleInstructorEntity2);
    instructor2.instructorProfile = new InstructorEntity({
      id: instructor2.id,
      groupId: exampleInstructorEntity2.groupId,
      department: department2,
    });
    instructor2 = await memberRepository.save(instructor2);

    student1 = await memberRepository.save(exampleStudent1Entity);
    student1.studentProfile = new StudentEntity({
      id: student1.id,
      groupId: exampleStudent1Entity.groupId,
      department: department,
    });
    student1 = await memberRepository.save(student1);

    student2 = await memberRepository.save(exampleStudent2Entity);
    student2.studentProfile = new StudentEntity({
      id: student2.id,
      groupId: exampleStudent2Entity.groupId,
      department: department,
    });
    student2 = await memberRepository.save(student2);

    student3 = await memberRepository.save(exampleStudent3Entity);
    student3.studentProfile = new StudentEntity({
      id: student3.id,
      groupId: exampleStudent3Entity.groupId,
      department: department2,
    });
    student3 = await memberRepository.save(student3);

    const exampleClassImage: ClassImageEntiy = {
      name: 'OS_Class_Image',
      repositoryEndpoint: 'local',
      status: status.SUCCESS,
      instructor: instructor.instructorProfile,
    } as ClassImageEntiy;

    classImage = await classImageRepository.save(exampleClassImage);
    exmapleClass = {
      name: 'OS',
      instructorId: instructor.id,
      maximum_student: 30,
      classImageId: classImage.id,
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          applicationName: 'Class-Service Test',
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(ClassEntity),
          useValue: dataSource.getRepository(ClassEntity),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: getRepositoryToken(ClassImageEntiy),
          useValue: dataSource.getRepository(ClassImageEntiy),
        },
        {
          provide: getRepositoryToken(DepartmentEntity),
          useValue: dataSource.getRepository(DepartmentEntity),
        },
        {
          provide: getRepositoryToken(MemberEntity),
          useValue: dataSource.getRepository(MemberEntity),
        },
        {
          provide: getRepositoryToken(InstructorEntity),
          useValue: dataSource.getRepository(InstructorEntity),
        },
        {
          provide: defaultConfig.KEY,
          useValue: {
            hashCount: 12,
          },
        },
        ClassService,
        MemberService,
        DepartmentService,
        ClassImageService,
        InstructorService,
      ],
    }).compile();

    service = module.get<ClassService>(ClassService);
  });

  afterEach(async () => {
    // After Each
  });

  afterAll(async () => {
    // End connection
    await dataSource.destroy();
    // Destroy container
    await container.stop();
  });

  describe('Create class', () => {
    it('Should create class', async () => {
      // Given
      // When
      classInfo = await service.createNewClass(exmapleClass);
      // Then
      expect(classImage).not.toBeUndefined();
    });

    it('Should create class because instructor already enroll class with same name', async () => {
      //Given
      //When
      try {
        classInfo = await service.createNewClass(exmapleClass);
      } catch (err) {
        expect(err).toBeInstanceOf(DuplicatedClassNameFound);
      }
    });

    it("Can't create class beacause image is yet pending", async () => {
      // Given
      // Change exampleClassimage to
      classImage.status = status.PENDING;
      await classImageRepository.save(classImage);
      // When
      try {
        await service.createNewClass(exmapleClass);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(ImageYetPending);
      }
    });

    it("Can't create class because image is failed to build", async () => {
      // Given
      classImage.status = status.FAIL;
      await classImageRepository.save(classImage);
      // When
      try {
        await service.createNewClass(exmapleClass);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(ImageBuildFailed);
      } finally {
        // Reset to success
        classImage.status = status.SUCCESS;
        await classImageRepository.save(classImage);
      }
    });
  });

  describe('Get class information', () => {
    it('Should get all classes', async () => {
      // Given
      //When
      const result = await service.getAllClass(1, 10);
      // Then
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });

    it('Should get class by id', async () => {
      //Given
      const id = classInfo.id;
      //When
      const result = await service.getClassById(id);
      //Then
      expect(result.name).toBe(classInfo.name);
    });

    it('Class Not Found', async () => {
      // Given
      const id = 100;
      // When
      try {
        await service.getClassById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(ClassNotFound);
      }
    });

    it('Should get class by name', async () => {
      //Given
      const name = classInfo.name;
      // When
      const result = await service.getClassByName(name);
      // Then
      expect(result).not.toBeUndefined();
      expect(result.length).toBe(1);
    });

    it('Should get class by instructor', async () => {
      //Given
      const instructorId = exmapleClass.instructorId;
      // When
      const result = await service.getClassByInstructor(instructorId);
      // Then
      expect(result.length).toBe(1);
    });

    it('Instructor not found', async () => {
      //Given
      const instructorId = 1000;
      // When
      try {
        await service.getClassByInstructor(instructorId);
      } catch (err) {
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it('Should get class by instructor and class name', async () => {
      // Given
      const instructorId = exmapleClass.instructorId;
      const className = exmapleClass.name;
      // When
      const result = await service.getClassByInstructorAndName(
        className,
        instructorId,
      );
      expect(result).not.toBeUndefined();
    });

    it("Can't get class because instructor not found", async () => {
      // Given
      const instructorId = 1000;
      const className = exmapleClass.name;
      // When
      try {
        await service.getClassByInstructorAndName(className, instructorId);
      } catch (err) {
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it("Can't get class because name not found", async () => {
      // Given
      const instructorId = exmapleClass.instructorId;
      const className = 'example';
      // When
      try {
        await service.getClassByInstructorAndName(className, instructorId);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(ClassNotFound);
      }
    });

    it('Should get class by department id', async () => {
      //Given
      const departmentId = department.id;
      //When
      const result = await service.getClassByDepartment(departmentId);
      // Then
      expect(result.length).toBe(1);
    });

    it("Can't get class because department not found", async () => {
      // Given
      const departmentId = 1000;
      // When
      try {
        await service.getClassByDepartment(departmentId);
      } catch (err) {
        expect(err).toBeInstanceOf(DepartmentNotFound);
      }
    });
    /**
     * TODO
     *
     * enroll
     *
     * getAvailableClass
     *
     */
  });

  describe('Enroll classes', () => {
    it('Generate new classes', async () => {
      const newClass1: CreateClassDto = {
        name: 'C Programming',
        instructorId: instructor2.id,
        maximum_student: 20,
        classImageId: classImage.id,
      };

      const newClass2: CreateClassDto = {
        name: 'Java Programming',
        instructorId: instructor.id,
        maximum_student: 30,
        classImageId: classImage.id,
      };

      classInfo2 = await service.createNewClass(newClass1);
      classInfo3 = await service.createNewClass(newClass2);
      const instructorClassList = await service.getClassByInstructor(
        instructor.id,
      );
      const instructor2ClassList = await service.getClassByInstructor(
        instructor2.id,
      );
      expect(instructorClassList.length).toBe(2);
      expect(instructor2ClassList.length).toBe(1);
    });

    it('Should get available classes', async () => {
      //Given
      const student1Id = student1.id;
      const student3Id = student3.id;
      // When
      const s1Res = await service.getAvailableClasses(student1);
      const s3Res = await service.getAvailableClasses(student3);
      // Then
      expect(s1Res.length).toBe(2);
      expect(s3Res.length).toBe(1);
    });

    it('Should enroll class', async () => {
      // Given
      const enroll1: EnrollClassDto = {
        studentId: student1.id,
        classId: classInfo.id,
      };
      const enroll2: EnrollClassDto = {
        studentId: student2.id,
        classId: classInfo.id,
      };
      // When
      const result = await service.enrollClass(enroll1, student1);
      const result2 = await service.enrollClass(enroll2, student2);
      // Then
      expect(result).toBe(true);
      expect(result2).toBe(true);
    });

    it('Unable to enroll class which enrolled before', async () => {
      // Given
      const enroll1: EnrollClassDto = {
        studentId: student1.id,
        classId: classInfo.id,
      };
      // When
      try {
        await service.enrollClass(enroll1, student1);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(UnavailableToEnroll);
      }
    });

    it('Update student count of class', async () => {
      // Given
      const updatedto: UpdateClassDto = {
        id: classInfo.id,
        maximum_student: 3,
      };
      // When
      const result = await service.updateClass(updatedto);
      // Then
      expect(result.maximum_student).toBe(3);
    });

    it("Can't update student count as lower than enrolled student", async () => {
      // Given
      const updatedto: UpdateClassDto = {
        id: classInfo.id,
        maximum_student: 1,
      };
      // When
      try {
        await service.updateClass(updatedto);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(CantUpdateToLowerBound);
      }
    });

    it('Should withdraw class', async () => {
      //Given
      const widthdrawDto: WithdrawClassDto = {
        classId: classInfo.id,
        studentId: student1.id,
      };
      //When
      const result = await service.withdrawClass(widthdrawDto);
      //Then
      const getStatus = await classRepository.findOne({
        where: {
          id: classInfo.id,
        },
        relations: {
          classtudent: {
            students: true,
          },
        },
      });
      expect(result).toBe(true);
      expect(getStatus.classtudent.length).toBe(1);
    });

    it('Should delete class', async () => {
      // Given
      const deleteDto: DeleteClassDto = {
        id: classInfo.id,
      };

      // When
      const result = await service.deleteClass(deleteDto);

      // Then
      expect(result).toBe(true);
    });

    it('Class should be delete properly', async () => {
      // Given
      const classId = classInfo.id;
      // When
      try {
        await service.getClassById(classId);
      } catch (err) {
        expect(err).toBeInstanceOf(ClassNotFound);
      }
    });
  });
});
