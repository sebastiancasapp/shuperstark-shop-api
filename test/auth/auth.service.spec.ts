import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../src/auth/auth.service';
import { User } from '../../src/auth/entities/user.entity';
import { CreateUserDto, LoginUserDto } from '../../src/auth/dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Partial<Repository<User>> & { findOne?: jest.Mock };
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    userRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should create a user and return token without password', async () => {
    const dto: CreateUserDto = { email: 'a@b.com', password: 'Abc123', fullName: 'Test' } as any;

    (userRepo.create as jest.Mock).mockImplementation((data) => ({ ...data }));
    (userRepo.save as jest.Mock).mockResolvedValue({ id: '1', email: dto.email, fullName: dto.fullName, password: 'hashed' });

    const result = await service.create(dto);

    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('token', 'jwt-token');
    expect((result as any).password).toBeUndefined();
  });

  it('should login successfully with valid credentials', async () => {
    const loginDto: LoginUserDto = { email: 'a@b.com', password: 'Abc123' } as any;

    const hashed = bcrypt.hashSync(loginDto.password, 10);

    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: '1', email: loginDto.email, password: hashed });

    const result = await service.login(loginDto);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email }, select: { email: true, password: true, id: true } });
    expect(result).toHaveProperty('token', 'jwt-token');
  });

  it('should throw UnauthorizedException when email not found', async () => {
    const loginDto: LoginUserDto = { email: 'nope@x.com', password: 'x' } as any;

    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password invalid', async () => {
    const loginDto: LoginUserDto = { email: 'a@b.com', password: 'wrong' } as any;

    const hashed = bcrypt.hashSync('right', 10);
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: '1', email: loginDto.email, password: hashed });

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
  });
});
