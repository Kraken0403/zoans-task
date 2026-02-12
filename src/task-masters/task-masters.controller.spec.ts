import { Test, TestingModule } from '@nestjs/testing';
import { TaskMastersController } from './task-masters.controller';
import { TaskMastersService } from './task-masters.service';

describe('TasksMastersController', () => {
  let controller: TaskMastersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskMastersController],
      providers: [TaskMastersService],
    }).compile();

    controller = module.get<TaskMastersController>(TaskMastersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
