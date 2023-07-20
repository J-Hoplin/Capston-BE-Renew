import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource, Repository, getRepository } from 'typeorm';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentEntity } from '@src/domain/student/student.entity';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { ClassEntity } from '@src/domain/class/class.entity';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  mockDepartment1,
  mockDepartment2,
  wrongMockDepartment1,
} from './test/index';
import {
  DepartmentNameAlreadyTaken,
  DepartmentNotFound,
  MemberStillBelongsToDepartment,
} from '@src/infrastructure/exceptions';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DeleteDepartmentDto } from './dto/delete-department.dto';

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
    jest.resetModules();
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

  // Test zone
  let newMember: DepartmentEntity;
  let newMember2: DepartmentEntity;
  describe('Create a new Department', () => {
    it('Department name should not be taken yet', async () => {
      // Given
      const name = mockDepartment1.name;
      // when
      const result = await service.checkDepartmentNameTaken(name);
      // then
      expect(result).toBe(true);
    });

    it('Should create new department', async () => {
      // Given
      const department1 = mockDepartment1;
      const department2 = mockDepartment2;
      // when
      newMember = await service.createDepartment(department1);
      newMember2 = await service.createDepartment(department2);
      // then
      expect(newMember.id).not.toBeUndefined();
      expect(newMember.name).toBe(department1.name);
      expect(newMember.url).toBe(department1.url);

      expect(newMember2.id).not.toBeUndefined();
      expect(newMember2.name).toBe(department2.name);
      expect(newMember2.url).toBe(department2.url);
    });

    it('Department name should be taken', async () => {
      // Given
      const name = mockDepartment1.name;
      // when
      try {
        const result = await service.checkDepartmentNameTaken(name);
      } catch (err) {
        // then
        expect(err).toBeInstanceOf(DepartmentNameAlreadyTaken);
      }
    });

    it('Should throw new error, reason of same name', async () => {
      // Given
      const wrongDepartment1 = wrongMockDepartment1;
      // When
      try {
        await service.createDepartment(wrongMockDepartment1);
      } catch (e) {
        // Then
        expect(e).toBeInstanceOf(DepartmentNameAlreadyTaken);
      }
    });
  });

  describe('Get department information', () => {
    it('Should able to search mockDepartment1. Relation as true', async () => {
      //Given
      const targetDepartment = {
        ...newMember,
      };
      // When
      const searchDepartment = await service.getDepartmentById(
        targetDepartment.id,
        true,
      );
      //Then
      expect(searchDepartment.id).toBe(targetDepartment.id);
      expect(searchDepartment.name).toBe(targetDepartment.name);
      expect(searchDepartment.students).not.toBeUndefined();
      expect(searchDepartment.instructors).not.toBeUndefined();
    });

    it('Should able to search mockDepartment2. Relation as false', async () => {
      // Given
      const targetDepartment = {
        ...newMember2,
      };
      // When
      const searchDepartment = await service.getDepartmentById(
        targetDepartment.id,
        false,
      );
      //Then
      expect(searchDepartment.id).toBe(targetDepartment.id);
      expect(searchDepartment.name).toBe(targetDepartment.name);
      expect(searchDepartment.students).toBeUndefined();
      expect(searchDepartment.instructors).toBeUndefined();
    });

    it('Non existing id should not be found', async () => {
      //Given
      const targetId = 10000;
      //When
      try {
        await service.getDepartmentById(targetId, false);
      } catch (e) {
        // Then
        expect(e).toBeInstanceOf(DepartmentNotFound);
      }
    });

    it('Should exist 2 departments', async () => {
      //Given
      //When
      const getAllDepartments = await service.getAllDepartments(false);
      //Then
      expect(getAllDepartments.length).toBe(2);
    });
  });

  describe('Update member information', () => {
    it('Change department name of mockDepartment1', async () => {
      // Given
      const changedDepartmentInformation: UpdateDepartmentDto = {
        id: newMember.id,
        name: 'changedDepartment1',
        phoneNumber: 'changedPhoneNumber',
        url: 'www.github.com',
      };
      // When
      const result = await service.updateDepartment(
        changedDepartmentInformation,
      );
      //Then
      expect(result.name).toBe(changedDepartmentInformation.name);
      expect(result.phoneNumber).toBe(changedDepartmentInformation.phoneNumber);
      expect(result.url).toBe(changedDepartmentInformation.url);
    });

    it("Unable to change department's name reason of same name", async () => {
      //Given
      const changedDepartmentInformation: UpdateDepartmentDto = {
        id: newMember2.id,
        name: 'changedDepartment1',
      };
      // When
      try {
        await service.updateDepartment(changedDepartmentInformation);
      } catch (e) {
        //Then
        expect(e).toBeInstanceOf(DepartmentNameAlreadyTaken);
      }
    });

    it('Should unable to update department reason of non exist', async () => {
      //Given
      const changedDepartmentInformation: UpdateDepartmentDto = {
        id: 10000,
      };
      //When
      try {
        await service.updateDepartment(changedDepartmentInformation);
      } catch (err) {
        expect(err).toBeInstanceOf(DepartmentNotFound);
      }
    });

    it('Should apply to database and able to read', async () => {
      // Given
      const targetId1 = newMember.id;

      // When
      const result1 = await service.getDepartmentById(targetId1, false);

      // Then
      expect(result1.name).toBe('changedDepartment1');
    });
  });

  describe('Delete departments - abnormal', () => {
    it('Unable to delete member which not exist', async () => {
      // Given
      const deleteDepartment: DeleteDepartmentDto = {
        id: 1000,
      };
      //When
      try {
        await service.deleteDepartment(deleteDepartment);
      } catch (err) {
        expect(err).toBeInstanceOf(DepartmentNotFound);
      }
    });

    it('Unable to delete member if student or instructor yet exist', async () => {
      // Mock findOneBy
      jest
        .spyOn(dataSource.getRepository(DepartmentEntity), 'findOne')
        .mockImplementationOnce(async () => {
          const mockResult = {
            ...newMember,
          };
          mockResult.students = [new StudentEntity({})];
          mockResult.instructors = [new InstructorEntity({})];
          return mockResult;
        });
      //Given
      const deleteDepartment: DeleteDepartmentDto = {
        id: 1000,
      };
      //When
      try {
        await service.deleteDepartment(deleteDepartment);
      } catch (err) {
        //Then
        expect(err).toBeInstanceOf(MemberStillBelongsToDepartment);
      }
    });

    it('Delete mockDepartment1, mockDepartment2', async () => {
      // Given
      const deleteDepartment1: DeleteDepartmentDto = {
        id: newMember.id,
      };
      const deleteDepartment2: DeleteDepartmentDto = {
        id: newMember2.id,
      };
      // When
      const result1 = await service.deleteDepartment(deleteDepartment1);
      const result2 = await service.deleteDepartment(deleteDepartment2);

      // Then
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });
});
