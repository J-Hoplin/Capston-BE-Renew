import { Test, TestingModule } from '@nestjs/testing';
import { ClassImageController } from './class-image.controller';
import { ClassImageService } from './class-image.service';

describe('ClassImageController', () => {
  let controller: ClassImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassImageController],
      providers: [
        {
          provide: ClassImageService,
          useValue: {
            getAllClassImages: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassImageController>(ClassImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
