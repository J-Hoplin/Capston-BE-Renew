import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  dataSourceMock,
  departmentRepositoryMockFactory,
  example_profile,
  memberRepositoryMockFactory,
  mockCreateMemberDto,
  mockCreateMemberDtoInstructor,
  mockMemberEntities,
} from './test';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import defaultConfig from '@src/config/config/default.config';
import { DataSource } from 'typeorm';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { member } from '@src/infrastructure/types';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { mockDepartment1 } from '../department/test';

describe('MemberService', () => {
  jest.setTimeout(300000);
  let service: MemberService;

  //Set test database container
  let container: StartedMySqlContainer;
  // DataSource
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

    // Mock department enttiy findone as always true
    jest
      .spyOn(dataSource.getRepository(DepartmentEntity), 'findOneBy')
      .mockImplementation(async () => {
        return {} as DepartmentEntity;
      });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          applicationName: 'Member-Service-Test',
        }),
      ],
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(MemberEntity),
          useValue: dataSource.getRepository(MemberEntity),
        },
        {
          provide: getRepositoryToken(DepartmentEntity),
          useValue: dataSource.getRepository(DepartmentEntity),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: defaultConfig.KEY,
          useValue: {
            hashCount: 12,
          },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  describe('Generate member', () => {
    it('Should generate member', async () => {
      //Given
      // When
      // Then
    });
  });
});
