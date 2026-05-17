import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../decorators/current-user.decorator';
import { UserRole } from '../definitions/model/user-role.enum';

const DEV_USER: JwtPayload = {
  sub: '00000000-0000-0000-0000-000000000001',
  email: 'dev@local',
  role: UserRole.ADMIN,
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (isAuthDisabled(this.config)) {
      const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
      request.user = DEV_USER;
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayload>(
    err: Error | null,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: number,
  ): TUser {
    if (isAuthDisabled(this.config)) {
      const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
      return (request.user ?? DEV_USER) as TUser;
    }
    return super.handleRequest(err, user, info, context, status) as TUser;
  }
}

export function isAuthDisabled(config?: ConfigService): boolean {
  const value =
    config?.get<string>('AUTH_DISABLED') ?? process.env.AUTH_DISABLED ?? 'false';
  return value.toString().trim().toLowerCase() === 'true';
}
