import { CreateDepartmentDto } from '../dto/create-department.dto';

export const mockDepartment1: CreateDepartmentDto = {
  name: 'DSC',
  phoneNumber: 'test',
  url: 'www.google.com',
};

// duplicated name
export const wrongMockDepartment1: CreateDepartmentDto = {
  name: 'DSC',
  phoneNumber: 'test',
  url: 'www.google.com',
};

export const mockDepartment2: CreateDepartmentDto = {
  name: 'CSE',
  phoneNumber: 'test',
  url: 'www.naver.com',
};
