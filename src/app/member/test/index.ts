import { MemberEntity } from '@src/domain/member/member.entity';
import { member } from '@src/infrastructure/types';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { UpdateMemberApprovalDto } from '../dto/updateMemberApproval.dto';
import { DeleteMemberDto } from '../dto/delete-member.dto';
import { MockType, RepositoryMockFactory } from '@src/infrastructure/test';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { DataSource, EntityManager, FindOptionsWhere } from 'typeorm';
import { MemberNotFound } from '@src/infrastructure/exceptions';
import { Readable } from 'stream';

export let mockMemberEntities: MemberEntity[] = [
  new MemberEntity({
    id: 1,
    name: 'hoplin',
    password: 'password',
    email: 'jhoplin7259@gmail.com',
    groupId: 'B889047',
    memberRole: member.Role.STUDENT,
  }),
  new MemberEntity({
    id: 2,
    name: 'hoplin2',
    password: 'password',
    email: 'jhyoon0815103@gmail.com',
    groupId: 'B889048',
    memberRole: member.Role.STUDENT,
  }),
];

export const mockCreateMemberDto: CreateMemberDto = {
  name: 'test',
  password: 'test',
  email: 'jhoplin72510@gmail.com',
  groupId: 'b889049',
  sex: member.Sex.MALE,
  birth: new Date(),
  memberRole: member.Role.STUDENT,
  departmentId: 1,
};

export const mockCreateMemberDtoInstructor: CreateMemberDto = {
  name: 'test',
  password: 'test',
  email: 'jsbn@gmail.com',
  groupId: 'instructor123',
  sex: member.Sex.MALE,
  birth: new Date(),
  memberRole: member.Role.INSTRUCTOR,
  departmentId: 1,
};

export const mockUpdateMemberDto: UpdateMemberDto = {
  id: 1,
  changedpassword: 'password',
  originalpassword: 'password',
  birth: new Date(),
};

export const mockUpdateMemberApprovalDto: UpdateMemberApprovalDto = {
  id: 1,
  approved: member.Approve.APPROVE,
  approvedReason: 'reason',
};

export const mockDeletememberDto: DeleteMemberDto = {
  id: 1,
  password: 'password',
};

export const memberRepositoryMockFactory: RepositoryMockFactory<
  MemberEntity
> = () => {
  return {
    find: jest.fn(() => {
      return mockMemberEntities;
    }),
    findOneBy: jest.fn((opt: FindOptionsWhere<MemberEntity>) => {
      let result: MemberEntity[];
      if (opt.id) {
        result = mockMemberEntities.filter((x) => x.id === opt.id);
      } else if (opt.groupId) {
        result = mockMemberEntities.filter((x) => x.groupId === opt.groupId);
      }
      if (!result.length) {
        return false;
      }
      return result[0];
    }),
    save: jest.fn((data) => {
      if (!data.id) {
        data.id = mockMemberEntities[mockMemberEntities.length - 1].id + 1;
      }
      const checkUserExist = mockMemberEntities.filter((x) => x.id === data.id);
      // Check unique values
      const checkEmailOrGroupId = mockMemberEntities.filter(
        (x) => x.email === data.email || x.groupId === data.groupId,
      );
      // update
      if (checkUserExist.length) {
        Object.assign(checkUserExist[0], data);
      }
      // insert
      else {
        if (checkEmailOrGroupId.length) {
          return false;
        }
        mockMemberEntities.push(data);
      }
      return data;
    }),
    delete: jest.fn((data) => {
      mockMemberEntities = mockMemberEntities.filter((x) => {
        return x.id !== data.id;
      });
    }),
  };
};

export const departmentRepositoryMockFactory: RepositoryMockFactory<
  DepartmentEntity
> = () => {
  return {
    findOneBy: jest.fn(() => true),
  };
};

// For transaction
export const mockEntityManager: MockType<EntityManager> = {
  getRepository: jest.fn(() => memberRepositoryMockFactory()),
};

// For datasource mock
export const dataSourceMock: MockType<Partial<DataSource>> = {
  transaction: jest.fn(async (cb) => {
    return await cb(mockEntityManager);
  }),
};

export const example_profile: Express.Multer.File = {
  filename: './test.jpg',
  fieldname: '',
  originalname: '',
  encoding: '',
  mimetype: '',
  size: 0,
  stream: new Readable(),
  destination: '',
  path: '',
  buffer: undefined,
};
