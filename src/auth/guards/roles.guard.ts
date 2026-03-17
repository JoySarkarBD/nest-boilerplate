/**
 * @fileoverview RBAC (Role-Based Access Control) Guard.
 *
 * Verifies that the authenticated user possesses at least one of
 * the required roles specified via the @Roles() decorator.
 */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';

/**
 * RolesGuard checks the user's role against the required roles for a route.
 * It assumes that the request already has a 'user' object attached
 * (typically by the JwtAuthGuard).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Validates the current user's role against the required roles for the endpoint.
   *
   * @param context - ExecutionContext providing access to the current request.
   * @returns true if the user's role is authorized, otherwise throws a ForbiddenException.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
