import { Request } from 'express';
import { UserRole } from './user.types';

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IAuthRequest extends Request {
  user?: IJWTPayload;
}
