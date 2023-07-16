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

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          applicationName: 'test',
        }),
      ],
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(MemberEntity),
          useFactory: memberRepositoryMockFactory,
        },
        {
          provide: getRepositoryToken(DepartmentEntity),
          useFactory: departmentRepositoryMockFactory,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
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

  describe('Get all members', () => {
    it('Get all members', async () => {
      const result = await service.getAllMembers(true);
      expect(result).toMatchObject(mockMemberEntities);
      expect(result).toHaveLength(mockMemberEntities.length);
    });
  });

  describe('Get member by id', () => {
    const targetId = 1;
    const missTargetid = 2000;
    it(`If member exist`, async () => {
      const result = await service.getMemberById(targetId);
      const estimate = mockMemberEntities.filter((x) => x.id === targetId);
      expect(result).toMatchObject(estimate[0]);
    });

    it(`If member not exist`, async () => {
      try {
        await service.getMemberById(missTargetid);
      } catch (e) {
        expect(e).toBeInstanceOf(MemberNotFound);
        expect(e.message).toBe(`Member with id ${missTargetid} not found`);
      }
    });
  });

  describe('Get member by Group Id', () => {
    const targetGid = 'B889047';
    const missTargetGid = 'test';
    it(`If member exist`, async () => {
      const result = await service.getMemberByGroupId(targetGid);
      const estimate = mockMemberEntities.filter(
        (x) => x.groupId === targetGid,
      );
      expect(result).toMatchObject(estimate[0]);
      expect(result.groupId).toBe(targetGid);
    });

    it(`If member not exist`, async () => {
      try {
        await service.getMemberByGroupId(missTargetGid);
      } catch (e) {
        expect(e).toBeInstanceOf(MemberNotFound);
        expect(e.message).toBe(
          `Member with group id ${missTargetGid} not found`,
        );
      }
    });
  });

  describe('Create & Delete new member - student', () => {
    const originalPassword = mockCreateMemberDto.password;
    let newMemberResult: MemberEntity;
    it('Create new user', async () => {
      newMemberResult = await service.createMember(
        mockCreateMemberDto,
        example_profile,
      );
      expect(newMemberResult.groupId).toBe(mockCreateMemberDto.groupId);
      expect(newMemberResult.studentProfile).not.toBeNull();
      expect(newMemberResult.instructorProfile).toBeUndefined();
    });

    it('Member with same group id exist', async () => {
      const result = await service.createMember(
        mockCreateMemberDto,
        example_profile,
      );
      expect(result).toBe(false);
    });

    it('Check member exist', async () => {
      const result = await service.getMemberById(newMemberResult.id);
      expect(result.id).toBe(newMemberResult.id);
    });

    it("Check new member's approval", async () => {
      expect(await service.getMemberApproval(newMemberResult.id)).toBe(
        member.Approve.APPROVE,
      );
    });

    it('Delete member', async () => {
      expect(
        await service.deleteMember({
          id: newMemberResult.id,
          password: originalPassword,
        }),
      ).toBe(true);
    });
  });

  describe('Create & Delete new member - instructor', () => {
    const originalPassword = mockCreateMemberDtoInstructor.password;
    let newMemberResult: MemberEntity;
    it('Create new user', async () => {
      newMemberResult = await service.createMember(
        mockCreateMemberDtoInstructor,
        example_profile,
      );
      expect(newMemberResult.groupId).toBe(
        mockCreateMemberDtoInstructor.groupId,
      );
      expect(newMemberResult.instructorProfile).not.toBeNull();

      expect(newMemberResult.studentProfile).toBeUndefined();
    });

    it('Member with same group id exist', async () => {
      const result = await service.createMember(
        mockCreateMemberDtoInstructor,
        example_profile,
      );
      expect(result).toBe(false);
    });

    it('Check member exist', async () => {
      const result = await service.getMemberById(newMemberResult.id);
      expect(result.id).toBe(newMemberResult.id);
    });

    it("Check new member's approval", async () => {
      /**
       * Instructor's approval should be pending first
       */
      expect(await service.getMemberApproval(newMemberResult.id)).toBe(
        member.Approve.PENDING,
      );
    });
    it('Delete member', async () => {
      expect(
        await service.deleteMember({
          id: newMemberResult.id,
          password: originalPassword,
        }),
      ).toBe(true);
    });
  });
});
