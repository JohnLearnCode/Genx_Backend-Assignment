import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { IJWTPayload } from '../types/auth.types';

export const generateAccessToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
  });
};

export const generateRefreshToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
  });
};

export const verifyAccessToken = (token: string): IJWTPayload => {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as IJWTPayload;
};

export const verifyRefreshToken = (token: string): IJWTPayload => {
  return jwt.verify(token, jwtConfig.refreshTokenSecret) as IJWTPayload;
};
