import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../model/user.model';
import { ICreateUserDTO, IUpdateUserDTO, IUser } from '../types/user.types';

export class UserService {
  async createUser(data: ICreateUserDTO): Promise<any> {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Email already exists',
      };
    }

    const user = await UserModel.create(data);
    return user.toJSON();
  }

  async getUserById(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };
    }
    return user.toJSON();
  }

  async getAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: any[]; total: number; page: number; totalPages: number }> {
    const { role, isActive, page = 1, limit = 10 } = filters || {};
    
    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return {
      users: users.map((user) => user.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(userId: string, data: IUpdateUserDTO): Promise<any> {
    if (data.email) {
      const existingUser = await UserModel.findOne({
        email: data.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw {
          status: StatusCodes.CONFLICT,
          message: 'Email already exists',
        };
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };
    }

    return user.toJSON();
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };
    }
  }

  async toggleUserStatus(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };
    }

    user.isActive = !user.isActive;
    await user.save();

    return user.toJSON();
  }

  async getUsersByRole(role: string): Promise<any[]> {
    const users = await UserModel.find({ role });
    return users.map((user) => user.toJSON());
  }
}
