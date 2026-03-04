export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "officio_token";
export const TOKEN_TTL_DAYS = Number(process.env.TOKEN_TTL_DAYS ?? "7");
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? JWT_SECRET;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@officio.local";
export const ADMIN_NAME = process.env.ADMIN_NAME ?? "Officio Admin";