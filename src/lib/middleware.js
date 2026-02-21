import { verifyToken } from './auth';
import { cookies } from 'next/headers';

export async function authenticateUser(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(req) {
  const user = await authenticateUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(req, requiredRoles) {
  const user = await requireAuth(req);
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  if (!requiredRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}
