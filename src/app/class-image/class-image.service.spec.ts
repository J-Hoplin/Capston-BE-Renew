import { Test, TestingModule } from '@nestjs/testing';
import { ClassImageService } from './class-image.service';

describe('ClassImageService', () => {
  let service: ClassImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassImageService],
    }).compile();

    service = module.get<ClassImageService>(ClassImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
