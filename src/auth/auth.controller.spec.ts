import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService: Partial<AuthService> = {
    create: jest.fn().mockResolvedValue({ id: 'u1', token: 't' }),
    login: jest.fn().mockResolvedValue({ id: 'u1', token: 't' }),
    checkAuthStatus: jest.fn().mockResolvedValue({ id: 'u1', token: 't' }),
  };

  beforeEach(() => {
    controller = new AuthController(mockAuthService as AuthService);
  });

  it('createUser should call authService.create', async () => {
    const dto: any = { email: 'a@b.com', password: 'x' };
    const res = await controller.createUser(dto);
    expect(mockAuthService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'u1', token: 't' });
  });

  it('loginUser should call authService.login', async () => {
    const dto: any = { email: 'a@b.com', password: 'x' };
    const res = await controller.loginUser(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'u1', token: 't' });
  });

  it('checkAuthStatus should call authService.checkAuthStatus', async () => {
    const user: any = { id: 'u1' };
    const res = await controller.checkAuthStatus(user as any);
    expect(mockAuthService.checkAuthStatus).toHaveBeenCalledWith(user);
    expect(res).toEqual({ id: 'u1', token: 't' });
  });

  it('testingPrivateRoute should return expected structure', () => {
    const req: any = { headers: { authorization: 'x' } };
    const user: any = { id: 'u1', email: 'a@b.com', fullName: 'X' };
    const rawHeaders = ['a','b'];
    const headers = { host: 'localhost' };

    const res = controller.testingPrivateRoute(req, user, user.email, rawHeaders as any, headers as any);

    expect(res).toHaveProperty('ok', true);
    expect(res).toHaveProperty('user');
    expect(res.user).toEqual(user);
  });

  it('privateRoute2 and privateRoute3 should return ok true with user', () => {
    const user: any = { id: 'u1' };
    expect(controller.privateRoute2(user as any)).toEqual({ ok: true, user });
    expect(controller.privateRoute3(user as any)).toEqual({ ok: true, user });
  });
});
