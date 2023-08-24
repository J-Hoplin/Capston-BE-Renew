import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberEntity } from '@src/domain/member/member.entity';
import {
  mockMemberEntities,
  mockCreateMemberDto,
  mockUpdateMemberDto,
  mockDeletememberDto,
  mockUpdateMemberApprovalDto,
} from './test';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CheckType } from './member.enum';

describe('MemberController', () => {
  let controller: MemberController;
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: {
            getAllMembers: (detail) => {
              return mockMemberEntities;
            },
            getMemberById: (id: number) => {
              const result = mockMemberEntities.filter((x) => x.id === id);
              return result;
            },
            getMemberByGroupId: (gid: string) => {
              const result = mockMemberEntities.filter(
                (x) => x.groupId === gid,
              );
              return result;
            },
            createMember: jest.fn(),
            updateMember: jest.fn(),
            getMemberApproval: jest.fn(),
            updateMemberApproval: jest.fn(),
            deleteMember: jest.fn(),
            checkEmailTaken: jest.fn(),
            checkGidTaken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    service = module.get<MemberService>(MemberService);
  });

  describe('findAll', () => {
    it('Should get all member list', async () => {
      expect(await controller.getAllMembers(1, 10)).toBe(mockMemberEntities);
    });

    it("Should call service's getAllMembers once", async () => {
      const spy = jest.spyOn(service, 'getAllMembers');
      expect(await controller.getAllMembers(1, 10)).toBe(mockMemberEntities);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('findById', () => {
    const id = 1;
    const findMember = mockMemberEntities.filter((x) => x.id === id);

    it('Should get member with ID 1', async () => {
      expect(await controller.getMemberById(id)).toMatchObject(findMember);
    });

    it("Should call service's getMemberById once", async () => {
      const spy = jest.spyOn(service, 'getMemberById');
      expect(await controller.getMemberById(id)).toMatchObject(findMember);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('findByGroupId', () => {
    const gid = 'B889047';
    const findMember = mockMemberEntities.filter((x) => x.groupId === gid);

    it(`Should get member with Group ID ${gid}`, async () => {
      expect(await controller.getMemberByGroupId(gid)).toMatchObject(
        findMember,
      );
    });

    it("Should call service's getMemberByGroupId once", async () => {
      const spy = jest.spyOn(service, 'getMemberByGroupId');
      expect(await controller.getMemberByGroupId(gid)).toMatchObject(
        findMember,
      );
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Check email and group id taken', () => {
    const gid = 'abcd';
    const email = 'jhoplin7259@gmail.com';

    it('Should check email already taken', async () => {
      const spy = jest.spyOn(service, 'checkValueIsAvailable');
      await controller.checkValueIsAvailable(CheckType.EMAIL, email);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should check gid already taken', async () => {
      const spy = jest.spyOn(service, 'checkValueIsAvailable');
      await controller.checkValueIsAvailable(CheckType.GID, gid);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Create new member', () => {
    it("Should call service's createMember once", async () => {
      const spy = jest.spyOn(service, 'createMember');
      await controller.createMember(mockCreateMemberDto);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Update member', () => {
    it("Should call service's updateMember once", async () => {
      const spy = jest.spyOn(service, 'updateMember');
      await controller.updateMember(mockUpdateMemberDto, {} as MemberEntity);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Get member approval', () => {
    it('Should call getMemberApprobal once', async () => {
      const spy = jest.spyOn(service, 'getMemberApproval');
      await controller.getMemberApproval(1);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Update member approval', () => {
    it('Shoudl call updateMemberApproval once', async () => {
      const spy = jest.spyOn(service, 'updateMemberApproval');
      await controller.updateMemberApproval(mockUpdateMemberApprovalDto);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('Delete member approval', () => {
    it('Should call deleteMemberApproval once', async () => {
      const spy = jest.spyOn(service, 'deleteMember');
      await controller.deleteMember(mockDeletememberDto, {} as MemberEntity);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
