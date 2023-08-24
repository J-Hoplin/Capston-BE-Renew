import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  mockCreateMemberDtoStudent,
  mockCreateMemberDtoInstructorS as mockCreateMemberDtoInstructor,
} from './test';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import defaultConfig from '@src/config/config/default.config';
import { DataSource } from 'typeorm';
import {
  EmailAlreadyTaken,
  EmailYetConfirmed,
  GroupIDAlreadyTaken,
  InvalidMemberApproval,
  MemberNotFound,
  PasswordUnmatched,
} from '@src/infrastructure/exceptions';
import { member } from '@src/infrastructure/types';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { mockDepartment1 } from '../department/test';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateMemberApprovalDto } from './dto/updateMemberApproval.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { CheckType } from './member.enum';

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

  afterEach(async () => {
    // After Each
  });

  afterAll(async () => {
    // End connection
    await dataSource.destroy();
    // Destroy container
    await container.stop();
  });

  // Departments
  let department: DepartmentEntity;
  // Members
  let memberStudent: MemberEntity;
  let memberInstructor: MemberEntity;

  // Create
  describe('Generate member', () => {
    it('Email should not be taken', async () => {
      // Given
      const email = mockCreateMemberDtoStudent(1).email;
      // When
      const result = await service.checkValueIsAvailable(
        CheckType.EMAIL,
        email,
      );
      // Then
      expect(result).toBe(true);
    });

    it('Group ID should not be taken', async () => {
      // Given
      const gid = mockCreateMemberDtoStudent(1).groupId;
      // When
      const result = await service.checkValueIsAvailable(CheckType.GID, gid);
      // Then
      expect(result).toBe(true);
    });

    it('Should generate member - student', async () => {
      // Create department
      const repo = dataSource.getRepository(DepartmentEntity);
      department = await repo.save(mockDepartment1);
      //Given
      const student = mockCreateMemberDtoStudent(department.id);
      // When
      memberStudent = await service.createMember(student);
      // Then
      expect(memberStudent).not.toBeUndefined();
      expect(memberStudent.approved).toBe(member.Approve.APPROVE);
      expect(memberStudent.id).not.toBeUndefined();
    });

    it('Should generate member - instructor', async () => {
      // Given
      const instructor = mockCreateMemberDtoInstructor(department.id);
      // When
      memberInstructor = await service.createMember(instructor);
      // Then
      expect(memberInstructor).not.toBeUndefined();
      expect(memberInstructor.approved).toBe(member.Approve.PENDING);
      expect(memberInstructor.id).not.toBeUndefined();
    });

    it('Email should not be taken', async () => {
      // Given
      const email = mockCreateMemberDtoStudent(1).email;
      // When
      const result = await service.checkValueIsAvailable(
        CheckType.EMAIL,
        email,
      );
      expect(result).toBe(false);
    });

    it('Group ID should not be taken', async () => {
      // Given
      const gid = mockCreateMemberDtoStudent(1).groupId;
      // When
      const result = await service.checkValueIsAvailable(CheckType.GID, gid);
      expect(result).toBe(false);
    });

    it('Unable to generate member reason of existing group id', async () => {
      // Given
      const wrongMember = { ...mockCreateMemberDtoStudent(department.id) };
      // When
      try {
        memberInstructor = await service.createMember(wrongMember);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(GroupIDAlreadyTaken);
      }
    });
  });

  // Utility Test
  describe('Check utility function', () => {
    let compareEncryption;
    it('Should return encryption value', async () => {
      // Given
      const expected = memberStudent.password;
      // When
      compareEncryption = await service.hashPassword(
        mockCreateMemberDtoStudent(department.id).password,
      );
      // Then
      expect(compareEncryption).not.toBeUndefined();
    });
    it('Should compare as same string', async () => {
      //Given
      const password = compareEncryption;
      // When
      const result = await service.comparePassword(
        mockCreateMemberDtoStudent(department.id).password,
        password,
      );
      // Then
      expect(result).toBe(true);
    });
  });

  // Read
  describe('Get members', () => {
    it('Get all mmebers', async () => {
      // Given
      // When
      const result = await service.getAllMembers(1, 10);
      // Then
      expect(result.length).toBe(2);
    });

    it('Get member by id', async () => {
      //Given
      const studentId = memberStudent.id;
      const instructorId = memberInstructor.id;
      //When
      const resultStudent = await service.getMemberById(studentId);
      const resultInstructor = await service.getMemberById(instructorId);
      //Then
      expect(resultStudent).not.toBeUndefined();
      expect(resultStudent.id).toBe(memberStudent.id);
      expect(resultInstructor).not.toBeUndefined();
      expect(resultInstructor.id).toBe(memberInstructor.id);
    });

    it('Unable to get member with unexisting id', async () => {
      //Given
      const id = 1000;
      // When
      try {
        await service.getMemberById(id);
      } catch (err) {
        //Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it('Get member by gid', async () => {
      //Given
      const studentGid = memberStudent.groupId;
      const instructorGid = memberInstructor.groupId;
      // When
      const resultStudent = await service.getMemberByGroupId(studentGid);
      const resultInstructor = await service.getMemberByGroupId(instructorGid);
      // Then
      expect(resultStudent).not.toBeUndefined();
      expect(resultStudent.groupId).toBe(studentGid);
      expect(resultInstructor).not.toBeUndefined();
      expect(resultInstructor.groupId).toBe(instructorGid);
    });

    it('Unable to get member with unexisting gid', async () => {
      // Given
      const id = 'test';
      // When
      try {
        await service.getMemberByGroupId(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });

  describe("Get member's approval status", () => {
    it("Get member's approval status", async () => {
      // Given
      const studentId = memberStudent.id;
      const instructorId = memberInstructor.id;
      // When
      const resultStudent = await service.getMemberApproval(studentId);
      const resultInstructor = await service.getMemberApproval(instructorId);
      // Then
      expect(resultStudent).toBe(member.Approve.APPROVE);
      expect(resultInstructor).toBe(member.Approve.PENDING);
    });

    it("Unable to get member's gid with unexisting id", async () => {
      // Given
      const id = 10;
      // When
      try {
        await service.getMemberApproval(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });
  });

  describe('Update member information', () => {
    it("Update student's information", async () => {
      // Given
      const updateDto: UpdateMemberDto = {
        id: memberStudent.id,
        name: 'changed-student',
        changedpassword: 'changed-password',
        originalpassword: mockCreateMemberDtoStudent(department.id).password,
      };
      // When
      const result = await service.updateMember(updateDto, memberStudent);
      // Then
      expect(result.name).toBe('changed-student');
    });

    it("Update instructor's information", async () => {
      //Given
      const updateDto: UpdateMemberDto = {
        id: memberInstructor.id,
        name: 'changed-instructor',
        changedpassword: 'changed-password',
        originalpassword: mockCreateMemberDtoStudent(department.id).password,
      };
      // When
      const result = await service.updateMember(updateDto, memberInstructor);
      // Then
      expect(result.name).toBe('changed-instructor');
    });

    it("Should not change member's information if password unmatched", async () => {
      //Given
      const wrongDto: UpdateMemberDto = {
        id: memberStudent.id,
        originalpassword: 'wrong-password',
      };
      // When
      try {
        await service.updateMember(wrongDto, memberStudent);
      } catch (err) {
        expect(err).toBeInstanceOf(PasswordUnmatched);
      }
    });
  });

  describe("Update member's approval status", () => {
    it('Unable to change : Illegal approval status', async () => {
      //Given
      const wrongDto: UpdateMemberApprovalDto = {
        id: memberStudent.id,
        approved: 'illegal' as member.Approve,
        approvedReason: 'test',
      };
      // When
      try {
        await service.updateMemberApproval(wrongDto);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(Error);
      }
    });

    it("Should change member's approval", async () => {
      //Given
      const studentChangeDto: UpdateMemberApprovalDto = {
        id: memberStudent.id,
        approved: member.Approve.REJECT,
        approvedReason: 'test',
      };

      const instructorChangeDto: UpdateMemberApprovalDto = {
        id: memberInstructor.id,
        approved: member.Approve.APPROVE,
        approvedReason: 'test',
      };
      // When
      const resultStudent = await service.updateMemberApproval(
        studentChangeDto,
      );
      const resultInstructor = await service.updateMemberApproval(
        instructorChangeDto,
      );
      // Then
      expect(resultInstructor).toBe(true);
      expect(resultStudent).toBe(true);
    });

    it('Should be applied', async () => {
      //Given
      const studentId = memberStudent.id;
      const instructorId = memberInstructor.id;
      // When
      const studentResult = await service.getMemberById(studentId);
      const instructorResult = await service.getMemberById(instructorId);
      //Then
      expect(studentResult.approved).toBe(member.Approve.REJECT);
      expect(studentResult.approvedReason).toBe('test');
      expect(instructorResult.approved).toBe(member.Approve.APPROVE);
      expect(instructorResult.approvedReason).toBe('test');
    });
  });

  describe('It check student/instructor approved', () => {
    it('Should return student not found', async () => {
      // Given : Give instructor id
      const id = memberInstructor.id;
      try {
        // When
        await service.checkApprovedStudent(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(MemberNotFound);
      }
    });

    it('Should return Invalid member approval exception', async () => {
      //Given
      const id = memberStudent.id;
      try {
        // When
        await service.checkApprovedStudent(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(InvalidMemberApproval);
      }
    });

    it('Should return Email not confirmed exception', async () => {
      // Given
      // Change member approval
      await service.updateMemberApproval({
        id: memberStudent.id,
        approved: member.Approve.APPROVE,
        approvedReason: 'test',
      });
      memberStudent = await service.getMemberById(memberStudent.id);
      const id = memberStudent.id;
      try {
        // When
        await service.checkApprovedStudent(id);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(EmailYetConfirmed);
      }
    });

    it('Should return member entiity', async () => {
      // Given
      const repository = dataSource.getRepository(MemberEntity);
      memberStudent.emailConfirmed = true;
      await repository.save(memberStudent);
      const result = await service.checkApprovedStudent(memberStudent.id);
      expect(result).toBeInstanceOf(MemberEntity);
      expect(result.id).toBe(memberStudent.id);
    });
  });

  describe('Should delete member', () => {
    it("Can't delete password unmatched member", async () => {
      //Given
      const deletDto: DeleteMemberDto = {
        id: memberStudent.id,
        password: 'test',
      };
      // When
      try {
        await service.deleteMember(deletDto, memberStudent);
      } catch (err) {
        expect(err).toBeInstanceOf(PasswordUnmatched);
      }
    });

    it('Delete member', async () => {
      //Given
      const studentDeleteDto: DeleteMemberDto = {
        id: memberStudent.id,
        password: 'changed-password',
      };
      const instructorDeleteDto: DeleteMemberDto = {
        id: memberInstructor.id,
        password: 'changed-password',
      };
      //When
      const studentResult = await service.deleteMember(
        studentDeleteDto,
        memberStudent,
      );
      const instructorResult = await service.deleteMember(
        instructorDeleteDto,
        memberInstructor,
      );
      // Then
      expect(studentResult).toBe(true);
      expect(instructorResult).toBe(true);
    });
  });
});
