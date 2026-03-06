import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../service/auth.service';
import { IAuthRequest } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Refresh token is required',
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      res.status(StatusCodes.OK).json({
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Token refresh failed',
      });
    }
  }

  async getProfile(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      res.status(StatusCodes.OK).json({
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get profile',
      });
    }
  }
}
