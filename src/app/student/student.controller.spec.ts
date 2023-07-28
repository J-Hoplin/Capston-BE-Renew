import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

describe('Student Controller', () => {
  let controller: StudentController;
  let service: StudentService;

  const mockedService = {
    getStudentById: jest.fn(),
    getStudentByGid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        {
          provide: StudentService,
          useValue: mockedService,
        },
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    service = module.get<StudentService>(StudentService);
  });

  describe("It should call it's service once", () => {
    it('Get member by id', async () => {
      const spy = jest.spyOn(service, 'getStudentById');
      await controller.getStudentById(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Get member by group id', async () => {
      const spy = jest.spyOn(service, 'getStudentByGid');
      await controller.getStudentByGid('a');
      expect(spy).toBeCalledTimes(1);
    });
  });
});
