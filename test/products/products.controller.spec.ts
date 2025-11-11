import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  const mockService: Partial<ProductsService> = {
    create: jest.fn().mockResolvedValue({ id: 'p1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOnePlain: jest.fn().mockResolvedValue({ id: 'p1' }),
    update: jest.fn().mockResolvedValue({ id: 'p1' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    controller = new ProductsController(mockService as ProductsService);
  });

  it('create should call service.create and return', async () => {
    const dto: any = { title: 'T' };
    const user: any = { id: 'u1' };
    const res = await controller.create(dto, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, user);
    expect(res).toEqual({ id: 'p1' });
  });

  it('findAll should call service.findAll', async () => {
    const res = await controller.findAll({ limit: 10, offset: 0 } as any);
    expect(mockService.findAll).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('findOne should call service.findOnePlain', async () => {
    const res = await controller.findOne('term');
    expect(mockService.findOnePlain).toHaveBeenCalledWith('term');
    expect(res).toEqual({ id: 'p1' });
  });

  it('update should call service.update', async () => {
    const res = await controller.update('uuid', { title: 'x' } as any, { id: 'u' } as any);
    expect(mockService.update).toHaveBeenCalled();
    expect(res).toEqual({ id: 'p1' });
  });

  it('remove should call service.remove', async () => {
    await controller.remove('uuid');
    expect(mockService.remove).toHaveBeenCalledWith('uuid');
  });
});
