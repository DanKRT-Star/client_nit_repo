export interface Course {
    courseCode: string,
    courseName: string,
    description: string,
    credits: number,
    lecturerId: string,
    maxStudents: number
}

// Chuẩn hóa dữ liệu course từ API/backend nếu cần
export function normalizeCourse(raw: any): Course {
    return {
        courseCode: String(raw.courseCode || raw.code || raw.id || ''),
        courseName: String(raw.courseName || raw.name || ''),
        description: String(raw.description || ''),
        credits: Number(raw.credits || 0),
        lecturerId: String(raw.lecturerId || raw.lecturer_id || ''),
        maxStudents: Number(raw.maxStudents || raw.max_students || 0),
    };
}

// Kiểm tra dữ liệu hợp lệ
export function validateCourse(course: Partial<Course>): boolean {
    return !!(
        course.courseCode &&
        course.courseName &&
        typeof course.credits === 'number' &&
        course.credits > 0 &&
        course.lecturerId &&
        typeof course.maxStudents === 'number' &&
        course.maxStudents > 0
    );
}