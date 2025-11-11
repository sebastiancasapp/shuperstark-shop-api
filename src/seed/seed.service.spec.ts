import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { ProductsService } from './../products/products.service';
import { User } from '../auth/entities/user.entity';
import { initialData } from './data/seed-data';

describe('SeedService', () => {
  let service: SeedService;

  const mockProductsService = {
    deleteAllProducts: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(true),
  } as any;

  const execMock = jest.fn().mockResolvedValue(null);
  const qbMock = { delete: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), execute: execMock } as any;

  const mockUserRepo: any = {
    create: jest.fn().mockImplementation((u) => ({ ...u })),
    save: jest.fn().mockResolvedValue([{ id: 'u1', email: 'test1@google.com' }, { id: 'u2', email: 'test2@google.com' }]),
    createQueryBuilder: jest.fn().mockReturnValue(qbMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should run seed and call products service and user repo', async () => {
    const res = await service.runSeed();

    expect(mockProductsService.deleteAllProducts).toHaveBeenCalled();
    expect(mockUserRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalledWith(initialData.users);
    // products create should be called for each product in initialData
    expect(mockProductsService.create).toHaveBeenCalledTimes(initialData.products.length);
    expect(res).toBe('SEED EXECUTED');
  });
});
