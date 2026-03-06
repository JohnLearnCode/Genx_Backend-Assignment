import { StatusCodes } from 'http-status-codes';
import { ServiceRequestModel } from '../model/serviceRequest.model';
import { UserModel } from '../model/user.model';
import {
  ICreateServiceRequestDTO,
  IUpdateServiceRequestDTO,
  ServiceRequestStatus,
} from '../types/serviceRequest.types';
import { UserRole } from '../types/user.types';

export class ServiceRequestService {
  async createRequest(data: ICreateServiceRequestDTO, customerId: string): Promise<any> {
    // Kiểm tra customer tồn tại
    const customer = await UserModel.findById(customerId);
    if (!customer) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Customer not found',
      };
    }

    const request = await ServiceRequestModel.create({
      ...data,
      customerId,
    });

    return request.toJSON();
  }

  async getRequestById(requestId: string): Promise<any> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }
    return request.toJSON();
  }

  async getAllRequests(filters?: {
    customerId?: string;
    staffId?: string;
    status?: ServiceRequestStatus;
    priority?: 'low' | 'medium' | 'high';
    page?: number;
    limit?: number;
  }): Promise<{ requests: any[]; total: number; page: number; totalPages: number }> {
    const { customerId, staffId, status, priority, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (customerId) query.customerId = customerId;
    if (staffId) query.staffId = staffId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ServiceRequestModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      ServiceRequestModel.countDocuments(query),
    ]);

    return {
      requests: requests.map((req) => req.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyRequests(
    customerId: string,
    filters?: {
      status?: ServiceRequestStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ requests: any[]; total: number; page: number; totalPages: number }> {
    return this.getAllRequests({
      customerId,
      ...filters,
    });
  }

  async getAssignedRequests(
    staffId: string,
    filters?: {
      status?: ServiceRequestStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ requests: any[]; total: number; page: number; totalPages: number }> {
    return this.getAllRequests({
      staffId,
      ...filters,
    });
  }

  async getPendingRequests(): Promise<any[]> {
    const requests = await ServiceRequestModel.find({
      status: ServiceRequestStatus.PENDING,
    }).sort({ priority: -1, createdAt: 1 }); // High priority first, then oldest

    return requests.map((req) => req.toJSON());
  }

  async updateRequest(
    requestId: string,
    data: IUpdateServiceRequestDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }

    // Kiểm tra quyền: chỉ customer (owner) hoặc staff (assigned) hoặc admin mới được sửa
    const isOwner = request.customerId === userId;
    const isAssignedStaff = request.staffId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAssignedStaff && !isAdmin) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to update this request',
      };
    }

    // Customer chỉ có thể sửa nếu request đang pending
    if (isOwner && !isAssignedStaff && !isAdmin) {
      if (request.status !== ServiceRequestStatus.PENDING) {
        throw {
          status: StatusCodes.FORBIDDEN,
          message: 'You can only update pending requests',
        };
      }
    }

    const updatedRequest = await ServiceRequestModel.findByIdAndUpdate(
      requestId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedRequest!.toJSON();
  }

  async deleteRequest(requestId: string, userId: string, userRole: UserRole): Promise<void> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }

    // Kiểm tra quyền: chỉ customer (owner) hoặc admin mới được xóa
    const isOwner = request.customerId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only delete your own requests',
      };
    }

    // Chỉ có thể xóa request đang pending
    if (request.status !== ServiceRequestStatus.PENDING) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'You can only delete pending requests',
      };
    }

    await ServiceRequestModel.findByIdAndDelete(requestId);
  }

  async assignStaff(requestId: string, staffId: string): Promise<any> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }

    // Kiểm tra staff tồn tại
    const staff = await UserModel.findById(staffId);
    if (!staff) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Staff not found',
      };
    }

    // Kiểm tra staff có role teacher hoặc admin
    if (![UserRole.TEACHER, UserRole.ADMIN].includes(staff.role)) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Staff must have teacher or admin role',
      };
    }

    request.staffId = staffId;
    if (request.status === ServiceRequestStatus.PENDING) {
      request.status = ServiceRequestStatus.ASSIGNED;
    }
    await request.save();

    return request.toJSON();
  }

  async unassignStaff(requestId: string): Promise<any> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }

    request.staffId = undefined;
    if (request.status === ServiceRequestStatus.ASSIGNED) {
      request.status = ServiceRequestStatus.PENDING;
    }
    await request.save();

    return request.toJSON();
  }

  async updateStatus(
    requestId: string,
    status: ServiceRequestStatus,
    response: string | undefined,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Service request not found',
      };
    }

    // Kiểm tra quyền
    const isAssignedStaff = request.staffId === userId;
    const isAdmin = userRole === UserRole.ADMIN;
    const isOwner = request.customerId === userId;

    // Staff/Admin có thể update status
    if (!isAssignedStaff && !isAdmin) {
      // Customer chỉ có thể cancel request của mình
      if (isOwner && status === ServiceRequestStatus.CANCELLED) {
        request.status = status;
        if (response) request.response = response;
        await request.save();
        return request.toJSON();
      }

      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to update this request status',
      };
    }

    request.status = status;
    if (response) request.response = response;
    await request.save();

    return request.toJSON();
  }

  async getRequestStats(filters?: { staffId?: string; customerId?: string }): Promise<any> {
    const query: any = {};
    if (filters?.staffId) query.staffId = filters.staffId;
    if (filters?.customerId) query.customerId = filters.customerId;

    const requests = await ServiceRequestModel.find(query);

    const stats = {
      total: requests.length,
      pending: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    requests.forEach((request) => {
      switch (request.status) {
        case ServiceRequestStatus.PENDING:
          stats.pending++;
          break;
        case ServiceRequestStatus.ASSIGNED:
          stats.assigned++;
          break;
        case ServiceRequestStatus.IN_PROGRESS:
          stats.in_progress++;
          break;
        case ServiceRequestStatus.COMPLETED:
          stats.completed++;
          break;
        case ServiceRequestStatus.REJECTED:
          stats.rejected++;
          break;
        case ServiceRequestStatus.CANCELLED:
          stats.cancelled++;
          break;
      }

      if (request.priority) {
        stats.byPriority[request.priority]++;
      }
    });

    return stats;
  }
}
