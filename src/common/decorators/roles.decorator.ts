/**
 * @fileoverview Custom decorator to associate roles with a route handler.
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/schemas/user.schema';

/** Key used to store role metadata. */
export const ROLES_KEY = 'roles';

/**
 * Decorator that attaches an array of permitted roles to the route handler.
 * 
 * @param roles - One or more UserRole values.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
