import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { StudentService } from './student.service';
import { DataSource, Repository } from 'typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { exampleStudent1Entity } from '../class/test';
import { StudentEntity } from '@src/domain/student/student.entity';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberNotFound } from '@src/infrastructure/exceptions';

describe('Student Service', () => {
  jest.setTimeout(3000000);

  let service: StudentService;

  // Database Container
  let container: StartedMySqlContainer;
  //  Datasourse
  let dataSource: DataSource;

  // Example Repository
  let memberRepository: Repository<MemberEntity>;

  // Example Entities
  let student: MemberEntity;

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

    student = await memberRepository.save(exampleStudent1Entity);
    student.studentProfile = new StudentEntity({
      id: student.id,
      groupId: exampleStudent1Entity.groupId,
      department: {} as DepartmentEntity,
    });
    student = await memberRepository.save(student);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: dataSource.getRepository(StudentEntity),
        },
        StudentService,
      ],
    }).compile();
    service = module.get<StudentService>(StudentService);
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
      const id = student.id;
      // When
      const result = await service.getStudentById(id);
      // Then
      expect(result).not.toBeUndefined();
    });

    it("Can't get member because not found", async () => {
      // Given
      const id = 1000;
      // When
      try {
        await service.getStudentById(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });
  describe('Get by gid', () => {
    it('Should get member', async () => {
      //Given
      const gid = student.groupId;
      // When
      const result = await service.getStudentByGid(gid);
      // Then
      expect(result).not.toBeUndefined();
    });

    it("Can't get member because not found", async () => {
      //Given
      const gid = 'test';
      // When
      try {
        await service.getStudentByGid(gid);
      } catch (err) {
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });
});
