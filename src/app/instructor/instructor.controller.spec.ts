import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';

describe('InstructorController', () => {
  let controller: InstructorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
