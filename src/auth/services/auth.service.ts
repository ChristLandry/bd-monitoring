import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { LoginDto, AuthTokensDto } from '../definitions/dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly revokedTokens = new Set<string>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    if (this.revokedTokens.has(refreshToken)) {
      throw new UnauthorizedException('Token révoqué');
    }
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(
        refreshToken,
        { secret: this.config.get('JWT_REFRESH_SECRET', 'refresh-secret') },
      );
      return this.issueTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    this.revokedTokens.add(token);
    return { message: 'Déconnexion effectuée' };
  }

  private issueTokens(
    sub: string,
    email: string,
    role: string,
  ): AuthTokensDto {
    const payload = { sub, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET', 'dev-secret'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '3600s'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET', 'refresh-secret'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken, expiresIn: 3600 };
  }
}
