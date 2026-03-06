import rateLimit from 'express-rate-limit';
import { rateLimitConfig, strictRateLimitConfig } from '../config/rateLimit.config';

export const generalLimiter = rateLimit(rateLimitConfig);

export const strictLimiter = rateLimit(strictRateLimitConfig);
