import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServiceRequestService } from '../service/serviceRequest.service';
import { IAuthRequest } from '../types/auth.types';
import { ServiceRequestStatus } from '../types/serviceRequest.types';

const serviceRequestService = new ServiceRequestService();

export class ServiceRequestController {
  async createRequest(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const customerId = req.user!.userId;
      const request = await serviceRequestService.createRequest(req.body, customerId);
      res.status(StatusCodes.CREATED).json({
        message: 'Service request created successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create service request',
      });
    }
  }

  async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request = await serviceRequestService.getRequestById(id);
      res.status(StatusCodes.OK).json({
        message: 'Service request retrieved successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get service request',
      });
    }
  }

  async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, staffId, status, priority, page, limit } = req.query;
      const filters = {
        customerId: customerId as string,
        staffId: staffId as string,
        status: status as ServiceRequestStatus,
        priority: priority as 'low' | 'medium' | 'high',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await serviceRequestService.getAllRequests(filters);
      res.status(StatusCodes.OK).json({
        message: 'Service requests retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get service requests',
      });
    }
  }

  async getMyRequests(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const customerId = req.user!.userId;
      const { status, page, limit } = req.query;
      const filters = {
        status: status as ServiceRequestStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await serviceRequestService.getMyRequests(customerId, filters);
      res.status(StatusCodes.OK).json({
        message: 'Your service requests retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get your service requests',
      });
    }
  }

  async getAssignedRequests(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const staffId = req.user!.userId;
      const { status, page, limit } = req.query;
      const filters = {
        status: status as ServiceRequestStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await serviceRequestService.getAssignedRequests(staffId, filters);
      res.status(StatusCodes.OK).json({
        message: 'Assigned service requests retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get assigned service requests',
      });
    }
  }

  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const requests = await serviceRequestService.getPendingRequests();
      res.status(StatusCodes.OK).json({
        message: 'Pending service requests retrieved successfully',
        data: requests,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get pending service requests',
      });
    }
  }

  async updateRequest(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const request = await serviceRequestService.updateRequest(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Service request updated successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update service request',
      });
    }
  }

  async deleteRequest(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      await serviceRequestService.deleteRequest(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Service request deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete service request',
      });
    }
  }

  async assignStaff(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { staffId } = req.body;

      if (!staffId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Staff ID is required',
        });
        return;
      }

      const request = await serviceRequestService.assignStaff(id, staffId);
      res.status(StatusCodes.OK).json({
        message: 'Staff assigned successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to assign staff',
      });
    }
  }

  async unassignStaff(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request = await serviceRequestService.unassignStaff(id);
      res.status(StatusCodes.OK).json({
        message: 'Staff unassigned successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to unassign staff',
      });
    }
  }

  async updateStatus(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, response } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Status is required',
        });
        return;
      }

      const request = await serviceRequestService.updateStatus(
        id,
        status as ServiceRequestStatus,
        response,
        userId,
        userRole
      );
      res.status(StatusCodes.OK).json({
        message: 'Service request status updated successfully',
        data: request,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update service request status',
      });
    }
  }

  async getRequestStats(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { staffId, customerId } = req.query;
      const filters = {
        staffId: staffId as string,
        customerId: customerId as string,
      };

      const stats = await serviceRequestService.getRequestStats(filters);
      res.status(StatusCodes.OK).json({
        message: 'Service request stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get service request stats',
      });
    }
  }
}
