import { Role, Permission } from '@prisma/client';

interface JwtUserData {
  userId: number;
  username: string;
  roles: Role[];
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

declare type UserKey = keyof JwtUserData;
