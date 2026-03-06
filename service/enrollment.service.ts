import { StatusCodes } from 'http-status-codes';
import { EnrollmentModel } from '../model/enrollment.model';
import { ClassModel } from '../model/class.model';
import { UserModel } from '../model/user.model';
import {
  ICreateEnrollmentDTO,
  IUpdateEnrollmentDTO,
  IEnrollStudentDTO,
  EnrollmentStatus,
} from '../types/enrollment.types';
import { UserRole } from '../types/user.types';

export class EnrollmentService {
  async enrollStudent(data: ICreateEnrollmentDTO, studentId: string): Promise<any> {
    // Kiểm tra student tồn tại
    const student = await UserModel.findById(studentId);
    if (!student) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Student not found',
      };
    }

    // Kiểm tra class tồn tại
    const classData = await ClassModel.findById(data.classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra class còn active không
    if (!classData.isActive) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Class is not active',
      };
    }

    // Kiểm tra class còn chỗ trống không
    if (classData.enrolledCount >= classData.capacity) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Class is full',
      };
    }

    // Kiểm tra đã enroll chưa
    const existingEnrollment = await EnrollmentModel.findOne({
      studentId,
      classId: data.classId,
    });
    if (existingEnrollment) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Already enrolled in this class',
      };
    }

    // Tạo enrollment
    const enrollment = await EnrollmentModel.create({
      studentId,
      classId: data.classId,
      notes: data.notes,
      status: EnrollmentStatus.PENDING,
      enrollAt: new Date(),
    });

    return enrollment.toJSON();
  }

  async enrollStudentByAdmin(data: IEnrollStudentDTO): Promise<any> {
    // Kiểm tra student tồn tại và có role student
    const student = await UserModel.findById(data.studentId);
    if (!student) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Student not found',
      };
    }

    if (student.role !== UserRole.STUDENT) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'User must be a student',
      };
    }

    return this.enrollStudent(
      {
        classId: data.classId,
        notes: data.notes,
      },
      data.studentId
    );
  }

  async getEnrollmentById(enrollmentId: string): Promise<any> {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Enrollment not found',
      };
    }
    return enrollment.toJSON();
  }

  async getAllEnrollments(filters?: {
    studentId?: string;
    classId?: string;
    status?: EnrollmentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ enrollments: any[]; total: number; page: number; totalPages: number }> {
    const { studentId, classId, status, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      EnrollmentModel.find(query).skip(skip).limit(limit).sort({ enrollAt: -1 }),
      EnrollmentModel.countDocuments(query),
    ]);

    return {
      enrollments: enrollments.map((enrollment) => enrollment.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyEnrollments(
    studentId: string,
    filters?: { status?: EnrollmentStatus; page?: number; limit?: number }
  ): Promise<{ enrollments: any[]; total: number; page: number; totalPages: number }> {
    return this.getAllEnrollments({
      studentId,
      ...filters,
    });
  }

  async getEnrollmentsByClass(classId: string): Promise<any[]> {
    const enrollments = await EnrollmentModel.find({ classId }).sort({ enrollAt: -1 });
    return enrollments.map((enrollment) => enrollment.toJSON());
  }

  async getPendingEnrollments(classId?: string): Promise<any[]> {
    const query: any = { status: EnrollmentStatus.PENDING };
    if (classId) query.classId = classId;

    const enrollments = await EnrollmentModel.find(query).sort({ enrollAt: 1 }); // Oldest first

    return enrollments.map((enrollment) => enrollment.toJSON());
  }

  async updateEnrollment(
    enrollmentId: string,
    data: IUpdateEnrollmentDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Enrollment not found',
      };
    }

    // Kiểm tra quyền: student (owner), teacher (class teacher), hoặc admin
    const isOwner = enrollment.studentId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    let isTeacher = false;
    if (userRole === UserRole.TEACHER) {
      const classData = await ClassModel.findById(enrollment.classId);
      isTeacher = classData?.teacherId === userId;
    }

    if (!isOwner && !isTeacher && !isAdmin) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to update this enrollment',
      };
    }

    // Student chỉ có thể update notes
    if (isOwner && !isTeacher && !isAdmin) {
      if (data.status || data.grade) {
        throw {
          status: StatusCodes.FORBIDDEN,
          message: 'You can only update notes',
        };
      }
    }

    // Nếu status thay đổi từ pending sang enrolled, cập nhật enrolledCount
    if (data.status && data.status !== enrollment.status) {
      const classData = await ClassModel.findById(enrollment.classId);
      if (!classData) {
        throw {
          status: StatusCodes.NOT_FOUND,
          message: 'Class not found',
        };
      }

      if (enrollment.status === EnrollmentStatus.PENDING && data.status === EnrollmentStatus.ENROLLED) {
        // Approve enrollment: tăng enrolledCount
        if (classData.enrolledCount >= classData.capacity) {
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: 'Class is full',
          };
        }
        classData.enrolledCount += 1;
        await classData.save();
      } else if (
        enrollment.status === EnrollmentStatus.ENROLLED &&
        [EnrollmentStatus.DROPPED, EnrollmentStatus.COMPLETED].includes(data.status)
      ) {
        // Drop or complete enrollment: giảm enrolledCount
        classData.enrolledCount = Math.max(0, classData.enrolledCount - 1);
        await classData.save();
      }
    }

    const updatedEnrollment = await EnrollmentModel.findByIdAndUpdate(
      enrollmentId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedEnrollment!.toJSON();
  }

  async deleteEnrollment(enrollmentId: string, userId: string, userRole: UserRole): Promise<void> {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Enrollment not found',
      };
    }

    // Kiểm tra quyền: student (owner) hoặc admin
    const isOwner = enrollment.studentId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only delete your own enrollments',
      };
    }

    // Chỉ có thể xóa enrollment đang pending hoặc rejected
    if (![EnrollmentStatus.PENDING, EnrollmentStatus.REJECTED].includes(enrollment.status)) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'You can only delete pending or rejected enrollments',
      };
    }

    await EnrollmentModel.findByIdAndDelete(enrollmentId);
  }

  async approveEnrollment(enrollmentId: string, userId: string, userRole: UserRole): Promise<any> {
    return this.updateEnrollment(
      enrollmentId,
      { status: EnrollmentStatus.ENROLLED },
      userId,
      userRole
    );
  }

  async rejectEnrollment(
    enrollmentId: string,
    notes: string | undefined,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    return this.updateEnrollment(
      enrollmentId,
      { status: EnrollmentStatus.REJECTED, notes },
      userId,
      userRole
    );
  }

  async dropEnrollment(enrollmentId: string, userId: string, userRole: UserRole): Promise<any> {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Enrollment not found',
      };
    }

    // Student chỉ có thể drop enrollment của mình
    const isOwner = enrollment.studentId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only drop your own enrollments',
      };
    }

    // Chỉ có thể drop enrollment đang enrolled
    if (enrollment.status !== EnrollmentStatus.ENROLLED) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'You can only drop enrolled enrollments',
      };
    }

    return this.updateEnrollment(enrollmentId, { status: EnrollmentStatus.DROPPED }, userId, userRole);
  }

  async getEnrollmentStats(filters?: { classId?: string; studentId?: string }): Promise<any> {
    const query: any = {};
    if (filters?.classId) query.classId = filters.classId;
    if (filters?.studentId) query.studentId = filters.studentId;

    const enrollments = await EnrollmentModel.find(query);

    const stats = {
      total: enrollments.length,
      pending: 0,
      enrolled: 0,
      completed: 0,
      dropped: 0,
      rejected: 0,
    };

    enrollments.forEach((enrollment) => {
      switch (enrollment.status) {
        case EnrollmentStatus.PENDING:
          stats.pending++;
          break;
        case EnrollmentStatus.ENROLLED:
          stats.enrolled++;
          break;
        case EnrollmentStatus.COMPLETED:
          stats.completed++;
          break;
        case EnrollmentStatus.DROPPED:
          stats.dropped++;
          break;
        case EnrollmentStatus.REJECTED:
          stats.rejected++;
          break;
      }
    });

    return stats;
  }
}
