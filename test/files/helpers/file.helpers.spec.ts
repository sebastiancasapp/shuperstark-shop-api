import { fileNamer } from '../../../src/files/helpers/fileNamer.helper';
import { fileFilter } from '../../../src/files/helpers/fileFilter.helper';

describe('file helpers', () => {
  describe('fileNamer', () => {
    it('should call callback with error if no file provided', () => {
      const cb = jest.fn();
      // @ts-ignore
      fileNamer({} as any, undefined, cb);

      expect(cb).toHaveBeenCalled();
      const call = cb.mock.calls[0];
      expect(call[0]).toBeInstanceOf(Error);
      expect(call[1]).toBe(false);
    });

    it('should generate a filename with correct extension', () => {
      const cb = jest.fn();
      const file: any = { mimetype: 'image/png' };

      // @ts-ignore
      fileNamer({} as any, file, cb);

      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/\.png$/));
    });
  });

  describe('fileFilter', () => {
    it('should call callback with error if no file provided', () => {
      const cb = jest.fn();
      // @ts-ignore
      fileFilter({} as any, undefined, cb);
      expect(cb).toHaveBeenCalled();
      const call = cb.mock.calls[0];
      expect(call[0]).toBeInstanceOf(Error);
      expect(call[1]).toBe(false);
    });

    it('should accept valid image mimetypes', () => {
      const cb = jest.fn();
      const file: any = { mimetype: 'image/jpeg' };
      // @ts-ignore
      fileFilter({} as any, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject invalid mimetypes', () => {
      const cb = jest.fn();
      const file: any = { mimetype: 'application/pdf' };
      // @ts-ignore
      fileFilter({} as any, file, cb);
      expect(cb).toHaveBeenCalledWith(null, false);
    });
  });
});
