import { Test, TestingModule } from '@nestjs/testing';
import { ClientGroupsController } from './client-groups.controller';
import { ClientGroupsService } from './client-groups.service';

describe('ClientGroupsController', () => {
  let controller: ClientGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientGroupsController],
      providers: [ClientGroupsService],
    }).compile();

    controller = module.get<ClientGroupsController>(ClientGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
