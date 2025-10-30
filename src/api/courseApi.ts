import { courseApi } from './api';
import type { Course } from '../util/courseUtils';

// Hàm lấy danh sách khóa học
export const getCoursesService = async (): Promise<Course[]> => {
  try {
    const res = await courseApi.getCourses();
    return res.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
    throw error;
  }
};

// Hàm lấy chi tiết khóa học theo ID
export const getCourseByIdService = async (courseId: string): Promise<Course> => {
  try {
    const res = await courseApi.getCourseById(courseId);
    return res.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi lấy chi tiết khóa học:', error);
    throw error;
  }
};
