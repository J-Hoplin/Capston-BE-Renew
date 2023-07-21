import { Test, TestingModule } from '@nestjs/testing';
import { ClassImageController } from './class-image.controller';

describe('ClassImageController', () => {
  let controller: ClassImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassImageController],
    }).compile();

    controller = module.get<ClassImageController>(ClassImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
