import { StatusCodes } from 'http-status-codes';
import { ClassModel } from '../model/class.model';
import { CourseModel } from '../model/course.model';
import { UserModel } from '../model/user.model';
import { ICreateClassDTO, IUpdateClassDTO } from '../types/class.types';
import { UserRole } from '../types/user.types';

export class ClassService {
  async createClass(data: ICreateClassDTO, teacherId: string): Promise<any> {
    // Kiểm tra course tồn tại
    const course = await CourseModel.findById(data.courseId);
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }

    // Kiểm tra teacher tồn tại
    const teacher = await UserModel.findById(teacherId);
    if (!teacher) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Teacher not found',
      };
    }

    // Kiểm tra support staff nếu có
    if (data.supportStaffId) {
      const supportStaff = await UserModel.findById(data.supportStaffId);
      if (!supportStaff) {
        throw {
          status: StatusCodes.NOT_FOUND,
          message: 'Support staff not found',
        };
      }
    }

    const classData = await ClassModel.create({
      ...data,
      teacherId,
    });

    return classData.toJSON();
  }

  async getClassById(classId: string): Promise<any> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }
    return classData.toJSON();
  }

  async getAllClasses(filters?: {
    courseId?: string;
    teacherId?: string;
    supportStaffId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ classes: any[]; total: number; page: number; totalPages: number }> {
    const { courseId, teacherId, supportStaffId, isActive, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (courseId) query.courseId = courseId;
    if (teacherId) query.teacherId = teacherId;
    if (supportStaffId) query.supportStaffId = supportStaffId;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [classes, total] = await Promise.all([
      ClassModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      ClassModel.countDocuments(query),
    ]);

    return {
      classes: classes.map((cls) => cls.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClassesByCourse(courseId: string): Promise<any[]> {
    const classes = await ClassModel.find({ courseId }).sort({ createdAt: -1 });
    return classes.map((cls) => cls.toJSON());
  }

  async getClassesByTeacher(teacherId: string): Promise<any[]> {
    const classes = await ClassModel.find({ teacherId }).sort({ createdAt: -1 });
    return classes.map((cls) => cls.toJSON());
  }

  async getClassesBySupportStaff(supportStaffId: string): Promise<any[]> {
    const classes = await ClassModel.find({ supportStaffId }).sort({ createdAt: -1 });
    return classes.map((cls) => cls.toJSON());
  }

  async getAvailableClasses(): Promise<any[]> {
    const classes = await ClassModel.find({
      isActive: true,
      $expr: { $lt: ['$enrolledCount', '$capacity'] },
    }).sort({ createdAt: -1 });

    return classes.map((cls) => cls.toJSON());
  }

  async updateClass(
    classId: string,
    data: IUpdateClassDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra quyền: chỉ teacher tạo class hoặc admin mới được sửa
    if (userRole !== UserRole.ADMIN && classData.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only update your own classes',
      };
    }

    // Kiểm tra support staff nếu có
    if (data.supportStaffId) {
      const supportStaff = await UserModel.findById(data.supportStaffId);
      if (!supportStaff) {
        throw {
          status: StatusCodes.NOT_FOUND,
          message: 'Support staff not found',
        };
      }
    }

    // Kiểm tra capacity không được nhỏ hơn enrolledCount
    if (data.capacity && data.capacity < classData.enrolledCount) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: `Capacity cannot be less than enrolled count (${classData.enrolledCount})`,
      };
    }

    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedClass!.toJSON();
  }

  async deleteClass(classId: string, userId: string, userRole: UserRole): Promise<void> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra quyền: chỉ teacher tạo class hoặc admin mới được xóa
    if (userRole !== UserRole.ADMIN && classData.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only delete your own classes',
      };
    }

    // Không cho phép xóa class đã có người enroll
    if (classData.enrolledCount > 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Cannot delete class with enrolled students',
      };
    }

    await ClassModel.findByIdAndDelete(classId);
  }

  async toggleClassStatus(classId: string, userId: string, userRole: UserRole): Promise<any> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN && classData.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only toggle status of your own classes',
      };
    }

    classData.isActive = !classData.isActive;
    await classData.save();

    return classData.toJSON();
  }

  async assignSupportStaff(
    classId: string,
    supportStaffId: string,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN && classData.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only assign support staff to your own classes',
      };
    }

    // Kiểm tra support staff tồn tại
    const supportStaff = await UserModel.findById(supportStaffId);
    if (!supportStaff) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Support staff not found',
      };
    }

    classData.supportStaffId = supportStaffId;
    await classData.save();

    return classData.toJSON();
  }

  async removeSupportStaff(classId: string, userId: string, userRole: UserRole): Promise<any> {
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN && classData.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only remove support staff from your own classes',
      };
    }

    classData.supportStaffId = undefined;
    await classData.save();

    return classData.toJSON();
  }
}
