import { MemberEntity } from '@src/domain/member/member.entity';
import { member } from '@src/infrastructure/types';

export const mockRedisCacheService = {
  get: jest.fn(() => true),
  set: jest.fn(),
  reset: jest.fn(),
  del: jest.fn(),
};

export const mockedMemberService = {
  getMemberById: jest.fn(() => mockedMemberEntity),
  getMemberByEmail: jest.fn(() => mockedMemberEntity),
  comparePassword: jest.fn(() => true),
  save: jest.fn(),
};

export const mockedMailService = {
  sendMail: jest.fn().mockImplementation(() => new Promise((res) => res(true))),
};

export const mockedMemberOriginalPassword = 'password';
export const expiredJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODk4NDk3MjEsImV4cCI6MTU5MDQ1NDUyMSwiaXNzIjoiaG9wbGluIiwic3ViIjoiUkVGUkVTSCJ9.-BsX7zlFpZaiy5DgrRVFqs08Sm_x6xIxemypG_fhZrE';

export const mockedMemberEntity: Partial<MemberEntity> = {
  sex: member.Sex.MALE,
  name: 'hoplin',
  memberRole: member.Role.STUDENT,
  groupId: '889047',
  password: '$2a$12$Z67OS6VLftrsRk42tZQr1O/WTjtrYrp2Qd8O5IWboh01bjE8pMJ.2',
  email: 'jhoplin7259@gmail.com',
  birth: new Date(),
  profileImgURL: null,
  approvedReason: 'New Member',
  approved: member.Approve.APPROVE,
  id: 1,
  emailConfirmed: true,
};
