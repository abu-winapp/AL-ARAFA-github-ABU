import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}

export function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);

  return payload?.exp ? payload.exp * 1000 : null;
}