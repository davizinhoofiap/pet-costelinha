import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'pet_costelinha_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  nome: string;
  email: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function getAuthenticatedUser(req?: Request): TokenPayload | null {
  let token = cookies().get('token')?.value;

  if (!token && req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export function requireAdminAuth(req?: Request, allowedRoles: Role[] = [Role.ADMIN, Role.GERENTE]): TokenPayload | null {
  const user = getAuthenticatedUser(req);
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}
