import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function isUserLoggedIn() {
  const user = await getUserFromCookie();
  return !!user;
}

export async function getUserRole() {
  const user = await getUserFromCookie();
  return user?.role || null;
}

export async function hasRole(requiredRoles) {
  const user = await getUserFromCookie();
  if (!user) return false;
  
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  
  return requiredRoles.includes(user.role);
}
