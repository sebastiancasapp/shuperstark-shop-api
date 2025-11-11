import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductsService } from '../../src/products/products.service';
import { Product } from '../../src/products/entities/product.entity';
import { ProductImage } from '../../src/products/entities/product-image.entity';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

describe('ProductsService', () => {
  let service: ProductsService;

  const productRepository: Partial<Repository<Product>> = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  } as any;

  const productImageRepository: Partial<Repository<ProductImage>> = {
    create: jest.fn(),
  } as any;

  const mockQueryRunner: any = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      delete: jest.fn(),
    }
  };

  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner)
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(ProductImage), useValue: productImageRepository },
        { provide: DataSource, useValue: dataSource }
      ]
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('create should create and save product and return images array', async () => {
    const dto: any = { title: 'T', images: ['a.png'] };
    const user: any = { id: 'u1' };

    (productRepository.create as jest.Mock).mockImplementation((p) => ({ ...p }));
    (productRepository.save as jest.Mock).mockResolvedValue({ id: 'p1', ...dto, images: [{ url: 'a.png' }] });
    (productImageRepository.create as jest.Mock).mockImplementation((i) => ({ ...i }));

    const res = await service.create(dto, user);

    expect(productRepository.create).toHaveBeenCalled();
    expect(productRepository.save).toHaveBeenCalled();
    expect(res.images).toEqual(['a.png']);
  });

  it('findAll should return products with image url strings', async () => {
    const products = [ { id: 'p1', images: [{ url: 'i1' }, { url: 'i2' }] } ];
    (productRepository.find as jest.Mock).mockResolvedValue(products as any);

    const res = await service.findAll({ limit: 10, offset: 0 } as any);

    expect(res[0].images).toEqual(['i1','i2']);
  });

  it('findOne should throw NotFoundException when product missing', async () => {
    (productRepository.findOneBy as jest.Mock).mockResolvedValue(null);

    const id = uuid();

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
  });

  it('findOne by slug should use query builder and return product', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'p1', images: [{ url: 'i1' }] })
    };

    (productRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const res = await service.findOne('some-slug');

    expect(productRepository.createQueryBuilder).toHaveBeenCalled();
    expect(res.images[0].url).toBe('i1');
  });

  it('update should handle images replacement and save via transaction', async () => {
    const id = 'p1';
    const user: any = { id: 'u1' };
    const updateDto: any = { images: ['n1.png','n2.png'], title: 'New' };

    const productEntity: any = { id, images: [{ url: 'old.png' }], user: { id: 'u2' } };

    (productRepository.preload as jest.Mock).mockResolvedValue(productEntity);
    (productImageRepository.create as jest.Mock).mockImplementation((o) => ({ ...o }));
    // mock query runner manager.save to resolve
    mockQueryRunner.manager.save.mockResolvedValue(productEntity);
    // mock findOnePlain to return plain object (spy on service)
    const plain = { id, title: 'New', images: ['n1.png','n2.png'] };
    jest.spyOn(service as any, 'findOnePlain').mockResolvedValue(plain as any);

    const res = await service.update(id, updateDto, user);

    expect(dataSource.createQueryRunner).toHaveBeenCalled();
    expect(mockQueryRunner.manager.delete).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    expect(res).toEqual(plain);
  });

  it('deleteAllProducts should call query builder delete', async () => {
    const qb: any = { delete: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), execute: jest.fn().mockResolvedValue(true) };
    (productRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const res = await service.deleteAllProducts();
    expect(qb.delete).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });
});
