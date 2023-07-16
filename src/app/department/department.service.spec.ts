import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource, getRepository } from 'typeorm';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentEntity } from '@src/domain/student/student.entity';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { ClassEntity } from '@src/domain/class/class.entity';

describe('DepartmentService', () => {
  jest.setTimeout(300000);
  let service: DepartmentService;

  // Database container
  let container: StartedMySqlContainer;
  // Datasource
  let dataSource: DataSource;
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({ applicationName: 'Department-Service Test' }),
      ],
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(DepartmentEntity),
          useValue: dataSource.getRepository(DepartmentEntity),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();
    service = module.get<DepartmentService>(DepartmentService);
  });

  afterEach(async () => {
    // Truncate table each time
    await dataSource.query(`TRUNCATE TABLE department;`);
  });

  afterAll(async () => {
    // End connection
    await dataSource.destroy();
    // Destroy container
    await container.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
