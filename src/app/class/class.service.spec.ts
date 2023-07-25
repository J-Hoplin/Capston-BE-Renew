import { Test, TestingModule } from '@nestjs/testing';
import { ClassService } from './class.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
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

describe('ClassService', () => {
  jest.setTimeout(3000000);
  let service: ClassService;

  // Database Container
  let container: StartedMySqlContainer;
  // Datasource
  let dataSource: DataSource;

  /**
   * Example Entities
   *
   */

  let department: DepartmentEntity;
  let instructor: MemberEntity;
  let student1: MemberEntity;
  let student2: MemberEntity;

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
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    const memberRepository = dataSource.getRepository(MemberEntity);

    department = await departmentRepository.save(exampleDepartmentEntity);
    exampleInstructorEntity.instructorProfile = new InstructorEntity({
      groupId: exampleInstructorEntity.groupId,
      department: department,
    });
    instructor = await memberRepository.save(exampleInstructorEntity);

    exampleStudent1Entity.studentProfile = new StudentEntity({
      groupId: exampleStudent1Entity.groupId,
      department: department,
    });
    student1 = await memberRepository.save(exampleStudent1Entity);

    exampleStudent2Entity.studentProfile = new StudentEntity({
      groupId: exampleStudent2Entity.groupId,
      department: department,
    });
    student2 = await memberRepository.save(exampleStudent2Entity);
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
          provide: defaultConfig.KEY,
          useValue: {
            hashCount: 12,
          },
        },
        ClassService,
        MemberService,
        DepartmentService,
        ClassImageService,
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

  it('', () => {
    expect(true);
  });
});
