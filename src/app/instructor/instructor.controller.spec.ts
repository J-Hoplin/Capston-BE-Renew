import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';

describe('InstructorController', () => {
  let controller: InstructorController;
  let service: InstructorService;

  const mockedService = {
    getInstructorById: jest.fn(),
    getInstructorByGid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [
        {
          provide: InstructorService,
          useValue: mockedService,
        },
      ],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
    service = module.get<InstructorService>(InstructorService);
  });

  describe("It should call it's service once", () => {
    it('Get member by id', async () => {
      const spy = jest.spyOn(service, 'getInstructorById');
      await controller.getInstructorById(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Get member by group id', async () => {
      const spy = jest.spyOn(service, 'getInstructorByGid');
      await controller.getInstructorByGroupId('a');
      expect(spy).toBeCalledTimes(1);
    });
  });
});
