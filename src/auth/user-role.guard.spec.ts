import { UserRoleGuard } from './guards/user-role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Partial<Reflector>;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new UserRoleGuard(reflector as Reflector);
  });

  const makeCtx = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => ({}),
      // @ts-ignore
    } as ExecutionContext;
  };

  it('should allow when no roles metadata', () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);
    const ok = guard.canActivate(makeCtx({ roles: ['admin'] }));
    expect(ok).toBe(true);
  });

  it('should allow when roles metadata empty', () => {
    (reflector.get as jest.Mock).mockReturnValue([]);
    const ok = guard.canActivate(makeCtx({ roles: ['admin'] }));
    expect(ok).toBe(true);
  });

  it('should throw BadRequestException when user not found', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeCtx(undefined))).toThrow('User not found');
  });

  it('should allow when user has one of valid roles', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin','super']);
    const ok = guard.canActivate(makeCtx({ roles: ['user','admin'], fullName: 'X' }));
    expect(ok).toBe(true);
  });

  it('should throw ForbiddenException when roles do not match', () => {
    (reflector.get as jest.Mock).mockReturnValue(['super']);
    expect(() => guard.canActivate(makeCtx({ roles: ['user'], fullName: 'X' }))).toThrow();
  });
});
