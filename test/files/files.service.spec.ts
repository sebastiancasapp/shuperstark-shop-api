import { FilesService } from '../../src/files/files.service';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    service = new FilesService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return path when file exists', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const res = service.getStaticProductImage('img.png');

    expect(res).toContain('static');
    expect(res).toContain('products');
    expect(res).toContain('img.png');
  });

  it('should throw BadRequestException when file does not exist', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(() => service.getStaticProductImage('nope.png')).toThrow(BadRequestException);
  });
});
