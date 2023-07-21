import { Test, TestingModule } from '@nestjs/testing';
import { InstructorService } from './instructor.service';

describe('InstructorService', () => {
  let service: InstructorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstructorService],
    }).compile();

    service = module.get<InstructorService>(InstructorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
