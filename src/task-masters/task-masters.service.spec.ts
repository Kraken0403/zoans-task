import { Test, TestingModule } from '@nestjs/testing';
import { TaskMastersService } from './task-masters.service';

describe('TasksMastersService', () => {
  let service: TaskMastersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskMastersService],
    }).compile();

    service = module.get<TaskMastersService>(TaskMastersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
