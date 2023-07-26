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
  exampleInstructorEntity,
  exampleStudent1Entity,
  exampleStudent2Entity,
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
  ClassNotFound,
  DuplicatedClassNameFound,
} from '@src/infrastructure/exceptions/class';
import { InstructorService } from '../instructor/instructor.service';

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
  let instructor: MemberEntity;
  let student1: MemberEntity;
  let student2: MemberEntity;
  let classInfo: ClassEntity;
  let classImage: ClassImageEntiy;

  /**
   * Example repository
   */
  let departmentRepository: Repository<DepartmentEntity>;
  let memberRepository: Repository<MemberEntity>;
  let classImageRepository: Repository<ClassImageEntiy>;

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

    department = await departmentRepository.save(exampleDepartmentEntity);
    instructor = await memberRepository.save(exampleInstructorEntity);
    instructor.instructorProfile = new InstructorEntity({
      id: instructor.id,
      groupId: exampleInstructorEntity.groupId,
      department: department,
    });
    instructor = await memberRepository.save(instructor);

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

    it("Can't create class because member not found", async () => {
      // Given
      const exmapleClass: CreateClassDto = {
        name: 'OS',
        instructorId: 10000,
        maximum_student: 30,
        classImageId: classImage.id,
      };
      // When
      try {
        await service.createNewClass(exmapleClass);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it("Can't create class because instructor approve status is invalid", async () => {
      // Given
      instructor.approved = member.Approve.REJECT;
      await memberRepository.save(instructor);
      const exmapleClass: CreateClassDto = {
        name: 'OS',
        instructorId: instructor.id,
        maximum_student: 30,
        classImageId: classImage.id,
      };
      // When
      try {
        await service.createNewClass(exmapleClass);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(InvalidMemberApproval);
      } finally {
        // Reset to approve
        instructor.approved = member.Approve.APPROVE;
        await memberRepository.save(instructor);
      }
    });
    it("Can't create class because instrutor email yet confirmed", async () => {
      //Given
      instructor.emailConfirmed = false;
      await memberRepository.save(instructor);
      const exmapleClass: CreateClassDto = {
        name: 'OS',
        instructorId: instructor.id,
        maximum_student: 30,
        classImageId: classImage.id,
      };
      // When
      try {
        await service.createNewClass(exmapleClass);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(EmailYetConfirmed);
      } finally {
        // Reset to true
        instructor.emailConfirmed = true;
        await memberRepository.save(instructor);
      }
    });
  });

  describe('Get class information', () => {
    it('Should get all classes', async () => {
      // Given
      //When
      const result = await service.getAllClass();
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
});
