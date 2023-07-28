import { MemberEntity } from '@src/domain/member/member.entity';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource, Repository } from 'typeorm';
import { exampleInstructorEntity } from '../class/test';
import { Test, TestingModule } from '@nestjs/testing';
import { InstructorService } from './instructor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { DepartmentEntity } from '@src/domain/department/department.entity';

describe('Instructor Service', () => {
  jest.setTimeout(3000000);

  let service: InstructorService;

  // Database Container
  let container: StartedMySqlContainer;
  // Datasource
  let dataSource: DataSource;

  // Example Repository
  let memberRepository: Repository<MemberEntity>;

  // Example Entities
  let instructor: MemberEntity;

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
    memberRepository = dataSource.getRepository(MemberEntity);

    instructor = await memberRepository.save(exampleInstructorEntity);
    instructor.instructorProfile = new InstructorEntity({
      id: instructor.id,
      groupId: exampleInstructorEntity.groupId,
      department: {} as DepartmentEntity,
    });
    instructor = await memberRepository.save(instructor);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(InstructorEntity),
          useValue: dataSource.getRepository(InstructorEntity),
        },
        InstructorService,
      ],
    }).compile();
    service = module.get<InstructorService>(InstructorService);
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

  describe('Get by ID', () => {
    it('Should get member', async () => {
      //Given
      const id = instructor.id;
      // When
      const result = await service.getInstructorById(id);
      // Then
      expect(result).not.toBeUndefined();
    });

    it("Can't get member because not found", async () => {
      // Given
      const id = 1000;
      // When
      try {
        await service.getInstructorById(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });

  describe('Get by gid', () => {
    it('Should get member', async () => {
      //Given
      const gid = instructor.groupId;
      // When
      const result = await service.getInstructorByGid(gid);
      // Then
      expect(result).not.toBeUndefined();
    });

    it("Can't get member because not found", async () => {
      //Given
      const gid = 'test';
      // When
      try {
        await service.getInstructorByGid(gid);
      } catch (err) {
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });
});
