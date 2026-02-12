import { Test, TestingModule } from '@nestjs/testing';
import { ClientGroupsService } from './client-groups.service';

describe('ClientGroupsService', () => {
  let service: ClientGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientGroupsService],
    }).compile();

    service = module.get<ClientGroupsService>(ClientGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
