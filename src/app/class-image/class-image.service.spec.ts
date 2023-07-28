import { Test, TestingModule } from '@nestjs/testing';
import { ClassImageService } from './class-image.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource, Repository } from 'typeorm';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { MemberService } from '../member/member.service';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  exampleDepartmentEntity,
  exampleInstructorEntity,
} from '../class/test';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { status } from '@src/infrastructure/types/class-image';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { ImageNotFound } from '@src/infrastructure/exceptions/class-image';
import { DeleteImageDto } from './dto/delete-image.dto';
import defaultConfig from '@src/config/config/default.config';

describe('ClassImageService', () => {
  jest.setTimeout(3000000);
  let service: ClassImageService;

  // DB Container
  let container: StartedMySqlContainer;
  // Datasource
  let datasource: DataSource;

  // Create mocked departmnent, instructor
  let department: DepartmentEntity;
  let instructor: MemberEntity;

  // Repository
  let departmentRepository: Repository<DepartmentEntity>;
  let memberRepository: Repository<MemberEntity>;

  beforeAll(async () => {
    container = await new MySqlContainer().start();
    datasource = await new DataSource({
      type: 'mysql',
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getUserPassword(),
      synchronize: true,
      entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
    }).initialize();

    departmentRepository = datasource.getRepository(DepartmentEntity);
    memberRepository = datasource.getRepository(MemberEntity);

    department = await departmentRepository.save(exampleDepartmentEntity);
    instructor = await memberRepository.save(exampleInstructorEntity);
    instructor.instructorProfile = new InstructorEntity({
      id: instructor.id,
      groupId: exampleInstructorEntity.groupId,
      department: department,
    });
    instructor = await memberRepository.save(instructor);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          applicationName: 'Class Image Service Test',
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(MemberEntity),
          useValue: datasource.getRepository(MemberEntity),
        },
        {
          provide: getRepositoryToken(DepartmentEntity),
          useValue: datasource.getRepository(DepartmentEntity),
        },
        {
          provide: getRepositoryToken(ClassImageEntiy),
          useValue: datasource.getRepository(ClassImageEntiy),
        },
        {
          provide: DataSource,
          useValue: datasource,
        },
        {
          provide: defaultConfig.KEY,
          useValue: {
            hashCount: 12,
          },
        },
        MemberService,
        ClassImageService,
      ],
    }).compile();

    service = module.get<ClassImageService>(ClassImageService);
  });

  afterEach(async () => {
    // After Each
  });

  afterAll(async () => {
    // End connection
    await datasource.destroy();
    // Destroy container
    await container.stop();
  });

  let generatedImage: ClassImageEntiy;
  describe('Class Image test', () => {
    it('Should create class image', async () => {
      // Given
      const dto: CreateImageDto = {
        name: 'OS_Class_Image',
        instructor_id: instructor.id,
        imageOptions: {},
      };
      // When
      generatedImage = await service.createClassImage(dto);
      //Then
      expect(generatedImage).not.toBeUndefined();
      expect(generatedImage.status).toBe(status.PENDING);
    });

    it("Can't create class image becasue instructor not exist", async () => {
      // Given
      const dto: CreateImageDto = {
        name: 'OS_Class_Image',
        instructor_id: 1000,
        imageOptions: {},
      };
      // When
      try {
        await service.createClassImage(dto);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it('Change status', async () => {
      //Given
      const changeStatus = status.SUCCESS;
      // When
      const result = await service.changeStatus({
        id: generatedImage.id,
        status: changeStatus,
      });
      // Then
      expect(result).toBe(true);
    });
    it("Can't change status because image not found", async () => {
      //Given
      const changeStatus = status.SUCCESS;
      // When
      try {
        await service.changeStatus({
          id: 1000,
          status: changeStatus,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ImageNotFound);
      }
    });

    it('Get all images', async () => {
      // Given
      // When
      const result = await service.getAllClassImages(1, 10);
      // Then
      expect(result.length).toBe(1);
    });

    it('Get image by id', async () => {
      //Given
      const id = generatedImage.id;
      // When
      const result = await service.getClassImageById(id);
      // Then
      expect(result.id).toBe(id);
    });

    it('Get image status', async () => {
      // Given
      const id = generatedImage.id;
      //When
      const result = await service.getClassImageStatus(id);
      // Then
      expect(result).toBe(status.SUCCESS);
    });
    it('Delete class image', async () => {
      // Given
      const id: DeleteImageDto = {
        id: generatedImage.id,
      };
      // When
      const result = await service.deleteClassImage(id);
      // Then
      expect(result).toBe(true);
    });

    it("Can't get image because it deleted", async () => {
      //Given
      const id = generatedImage.id;
      // When
      const result1 = await service.getAllClassImages(1, 10);
      // Then
      expect(result1.length).toBe(0);
      try {
        await service.getClassImageById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(ImageNotFound);
      }
    });
  });
});
