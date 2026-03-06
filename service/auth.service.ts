import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../model/user.model';
import { ILoginDTO, IRegisterDTO, IAuthTokens, IJWTPayload } from '../types/auth.types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { UserRole } from '../types/user.types';

export class AuthService {
  async register(data: IRegisterDTO): Promise<{ user: any; tokens: IAuthTokens }> {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Email already exists',
      };
    }

    const user = await UserModel.create({
      ...data,
      role: UserRole.STUDENT, // Mặc định là student
    });

    const payload: IJWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens: IAuthTokens = {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async login(data: ILoginDTO): Promise<{ user: any; tokens: IAuthTokens }> {
    const user = await UserModel.findOne({ email: data.email }).select('+password');
    
    if (!user) {
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid email or password',
      };
    }

    if (!user.isActive) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'Account is inactive',
      };
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid email or password',
      };
    }

    const payload: IJWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens: IAuthTokens = {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw {
          status: StatusCodes.UNAUTHORIZED,
          message: 'Invalid refresh token',
        };
      }

      const payload: IJWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    } catch (error) {
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid refresh token',
      };
    }
  }

  async getProfile(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };
    }
    return user.toJSON();
  }
}
