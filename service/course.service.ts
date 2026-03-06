import { StatusCodes } from 'http-status-codes';
import { CourseModel } from '../model/course.model';
import { ICreateCourseDTO, IUpdateCourseDTO } from '../types/course.types';
import { UserModel } from '../model/user.model';
import { UserRole } from '../types/user.types';

export class CourseService {
  async createCourse(data: ICreateCourseDTO, teacherId: string): Promise<any> {
    // Kiểm tra teacher tồn tại
    const teacher = await UserModel.findById(teacherId);
    if (!teacher) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Teacher not found',
      };
    }

    // Kiểm tra course code đã tồn tại
    const existingCourse = await CourseModel.findOne({ courseCode: data.courseCode });
    if (existingCourse) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Course code already exists',
      };
    }

    const course = await CourseModel.create({
      ...data,
      teacherId,
    });

    return course.toJSON();
  }

  async getCourseById(courseId: string): Promise<any> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }
    return course.toJSON();
  }

  async getCourseByCode(courseCode: string): Promise<any> {
    const course = await CourseModel.findOne({ courseCode: courseCode.toUpperCase() });
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }
    return course.toJSON();
  }

  async getAllCourses(filters?: {
    teacherId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: any[]; total: number; page: number; totalPages: number }> {
    const { teacherId, isActive, search, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (teacherId) query.teacherId = teacherId;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      CourseModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      CourseModel.countDocuments(query),
    ]);

    return {
      courses: courses.map((course) => course.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUpcomingCourses(limit: number = 10): Promise<any[]> {
    const now = new Date();
    const courses = await CourseModel.find({
      startDate: { $gt: now },
      isActive: true,
    })
      .sort({ startDate: 1 })
      .limit(limit);

    return courses.map((course) => course.toJSON());
  }

  async getOngoingCourses(): Promise<any[]> {
    const now = new Date();
    const courses = await CourseModel.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    }).sort({ startDate: -1 });

    return courses.map((course) => course.toJSON());
  }

  async getCoursesByTeacher(teacherId: string): Promise<any[]> {
    const courses = await CourseModel.find({ teacherId }).sort({ createdAt: -1 });
    return courses.map((course) => course.toJSON());
  }

  async updateCourse(
    courseId: string,
    data: IUpdateCourseDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }

    // Kiểm tra quyền: chỉ teacher tạo course hoặc admin mới được sửa
    if (userRole !== UserRole.ADMIN && course.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only update your own courses',
      };
    }

    // Kiểm tra course code nếu thay đổi
    if (data.courseCode && data.courseCode !== course.courseCode) {
      const existingCourse = await CourseModel.findOne({
        courseCode: data.courseCode,
        _id: { $ne: courseId },
      });
      if (existingCourse) {
        throw {
          status: StatusCodes.CONFLICT,
          message: 'Course code already exists',
        };
      }
    }

    // Kiểm tra capacity không được nhỏ hơn enrolledCount
    if (data.capacity && data.capacity < course.enrolledCount) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: `Capacity cannot be less than enrolled count (${course.enrolledCount})`,
      };
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedCourse!.toJSON();
  }

  async deleteCourse(courseId: string, userId: string, userRole: UserRole): Promise<void> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }

    // Kiểm tra quyền: chỉ teacher tạo course hoặc admin mới được xóa
    if (userRole !== UserRole.ADMIN && course.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only delete your own courses',
      };
    }

    // Không cho phép xóa course đã có người enroll
    if (course.enrolledCount > 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Cannot delete course with enrolled students',
      };
    }

    await CourseModel.findByIdAndDelete(courseId);
  }

  async toggleCourseStatus(courseId: string, userId: string, userRole: UserRole): Promise<any> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Course not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN && course.teacherId !== userId) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You can only toggle status of your own courses',
      };
    }

    course.isActive = !course.isActive;
    await course.save();

    return course.toJSON();
  }

  async getAvailableCourses(): Promise<any[]> {
    const now = new Date();
    const courses = await CourseModel.find({
      isActive: true,
      startDate: { $gt: now },
      $expr: { $lt: ['$enrolledCount', '$capacity'] },
    }).sort({ startDate: 1 });

    return courses.map((course) => course.toJSON());
  }
}
