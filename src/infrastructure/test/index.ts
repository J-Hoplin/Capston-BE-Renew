import { Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

export type RepositoryMockFactory<T> = () => MockType<Repository<T>>;
