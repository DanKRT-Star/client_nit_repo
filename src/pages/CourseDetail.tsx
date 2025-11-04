import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiErrorCircle } from 'react-icons/bi';
import { MdPlayLesson, MdAssignment } from 'react-icons/md';
import { GrCertificate } from 'react-icons/gr';
import { useCourseDetail, useEnrollCourse, useUnenrollCourse, useMyEnrollments } from '../hooks/useCourseQuery';
import { useAuthStore } from '../stores/authStore';
import { useCourseStore } from '../stores/courseStore';
import type { Course, Schedule } from '../api/courseApi';
import toast from 'react-hot-toast';
import UnenrollModal from '../components/UnenrollModal';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === 'student';

  // Lấy danh sách enrollments từ global store
  const allEnrollments = useCourseStore((s) => s.enrollments);

  const { data: course, isLoading, error } = useCourseDetail(id);
  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  // Sử dụng hook để lấy danh sách các khóa học đã đăng ký
  useMyEnrollments('ENROLLED');

  // Track enrolled schedules locally (để cập nhật UI tức thì sau khi nhấn)
  const [enrolledSchedules, setEnrolledSchedules] = useState<Set<string>>(new Set());
  const [unenrolledEnrollments, setUnenrolledEnrollments] = useState<Set<string>>(new Set());

  // Modal state - lưu enrollmentId thay vì scheduleId
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedEnrollmentForUnenroll, setSelectedEnrollmentForUnenroll] = useState<{
    enrollmentId: string;
    scheduleId: string;
    courseName: string;
    scheduleInfo: string;
  } | null>(null);

  // Tạo một Set chứa ID của các schedule đã đăng ký (từ store)
  const existingEnrollmentScheduleIds = useMemo(() => {
    if (!allEnrollments || allEnrollments.length === 0) {
      return new Set<string>();
    }
    return new Set(allEnrollments.map(e => e.scheduleId));
  }, [allEnrollments]);

  // Tạo Map để tra cứu enrollmentId từ scheduleId
  const scheduleToEnrollmentMap = useMemo(() => {
    if (!allEnrollments || allEnrollments.length === 0) {
      return new Map<string, string>();
    }
    return new Map(allEnrollments.map(e => [e.scheduleId, e.id]));
  }, [allEnrollments]);

  const handleEnroll = async (scheduleId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký khóa học');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      toast.error('Chỉ sinh viên mới có thể đăng ký khóa học');
      return;
    }

    try {
      await enrollMutation.mutateAsync(scheduleId);
      setEnrolledSchedules(prev => new Set(prev).add(scheduleId));
      setUnenrolledEnrollments(prev => {
        const enrollmentId = scheduleToEnrollmentMap.get(scheduleId);
        if (enrollmentId) {
          const newSet = new Set(prev);
          newSet.delete(enrollmentId);
          return newSet;
        }
        return prev;
      });
      toast.success('Đăng ký khóa học thành công! 🎉');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const handleUnenrollClick = (schedule: Schedule, courseName: string) => {
    // Tìm enrollmentId từ scheduleId
    const enrollmentId = scheduleToEnrollmentMap.get(schedule.id);
    
    if (!enrollmentId) {
      toast.error('Không tìm thấy thông tin đăng ký');
      return;
    }

    setSelectedEnrollmentForUnenroll({
      enrollmentId,
      scheduleId: schedule.id,
      courseName,
      scheduleInfo: `${schedule.dayOfWeek} | ${schedule.startTime} - ${schedule.endTime} | Phòng ${schedule.room}`,
    });
    setShowUnenrollModal(true);
  };

  const handleUnenrollConfirm = async () => {
    if (!selectedEnrollmentForUnenroll) return;

    try {
      // Gọi API với enrollmentId
      await unenrollMutation.mutateAsync(selectedEnrollmentForUnenroll.enrollmentId);
      
      // Cập nhật local state
      setUnenrolledEnrollments(prev => new Set(prev).add(selectedEnrollmentForUnenroll.enrollmentId));
      setEnrolledSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedEnrollmentForUnenroll.scheduleId);
        return newSet;
      });
      
      toast.success('Hủy đăng ký khóa học thành công!');
      setShowUnenrollModal(false);
      setSelectedEnrollmentForUnenroll(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Hủy đăng ký thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <AiOutlineLoading3Quarters className="animate-spin inline-block text-4xl mb-4" />
        <p className="text-gray-500 text-lg">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <BiErrorCircle className="inline-block text-red-500 text-5xl mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load course</h3>
        <p className="text-red-600 mb-4">
          {(error as unknown as { message?: string })?.message || 'Không thể tải chi tiết khóa học'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No course found.</p>
      </div>
    );
  }

  const c = course as Course;

  return (
    <div className="space-y-6 p-6 w-full max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden">
          <img
            loading="lazy"
            src={c.thumbnailUrl || `https://picsum.photos/seed/${c.courseCode}/640/360`}
            alt={c.courseName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <article>
            <h1 className="text-2xl font-bold">{c.courseName}</h1>
            <p className="text-sm text-secondary">
              Mã: <span className="font-medium">{c.courseCode}</span>
            </p>
          </article>

          {c.lecturer && (
            <article>
              <h4 className="text-sm font-semibold">Giảng viên</h4>
              <p className="text-sm text-secondary">
                {c.lecturer.user?.fullName} — {c.lecturer.title}
              </p>
              {c.lecturer.department && <p className="text-xs">{c.lecturer.department}</p>}
            </article>
          )}

          <section className="bg-background p-5 rounded-lg flex-1 shadow-md hover:shadow-lg">
            <h3 className="font-semibold">Mô tả</h3>
            <p className="text-sm text-secondary whitespace-pre-line">
              {c.description || 'No description provided.'}
            </p>
          </section>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background p-4 rounded-lg shadow-md flex items-center">
          <div className="p-2 bg-primary text-primary rounded-lg mr-3 flex items-center justify-center">
            <GrCertificate className="w-6 h-6" />
          </div>
          <article>
            <h4 className="text-secondary">Credit</h4>
            <p className="font-medium">{c.credits}</p>
          </article>
        </div>

        <div className="bg-background p-4 rounded-lg shadow-md flex items-center">
          <div className="p-2 bg-primary text-primary rounded-lg mr-3 flex items-center justify-center">
            <MdAssignment className="w-6 h-6" />
          </div>
          <article>
            <h4 className="text-secondary">Assignment</h4>
            <p className="font-medium">{c._count.assignments ?? 0}</p>
          </article>
        </div>

        <div className="bg-background p-4 rounded-lg shadow-md flex items-center">
          <div className="p-2 bg-primary text-primary rounded-lg mr-3 flex items-center justify-center">
            <MdPlayLesson className="w-6 h-6" />
          </div>
          <article>
            <h4 className="text-secondary">Lectures</h4>
            <p className="font-medium">{c._count.lectureMaterials ?? 0}</p>
          </article>
        </div>
      </section>

      {/* Schedules table */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Lịch học</h3>

        <section className="bg-background shadow-md w-full overflow-hidden rounded-lg">
          {(() => {
            const schedules = (c as Course & { schedules?: Schedule[] }).schedules ?? [];
            if (schedules.length === 0)
              return (
                <p className="text-secondary p-4">Chưa có lịch học cho khóa học này.</p>
              );

            return (
              <div className="overflow-x-auto lg:p-3">
                <table className="text-sm border-collapse w-full">
                  <thead>
                    <tr className="bg-primary text-primary">
                      <th className="hidden lg:table-cell px-3 py-2 text-center whitespace-nowrap">
                        Học kỳ
                      </th>
                      <th className="hidden lg:table-cell px-3 py-2 text-center whitespace-nowrap">
                        Năm học
                      </th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Thứ</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Giờ</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Phòng</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Từ - Đến</th>
                      <th className="hidden lg:table-cell px-3 py-2 text-center whitespace-nowrap">
                        Tuần
                      </th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Số lượng</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {schedules.map((s) => {
                      const isFull =
                        s._count?.enrollments && c.maxStudents
                          ? s._count.enrollments >= c.maxStudents
                          : false;
                      
                      // Check enrollment status
                      const isLocallyEnrolled = enrolledSchedules.has(s.id);
                      const isAlreadyEnrolled = existingEnrollmentScheduleIds.has(s.id);
                      const enrollmentId = scheduleToEnrollmentMap.get(s.id);
                      const isLocallyUnenrolled = enrollmentId ? unenrolledEnrollments.has(enrollmentId) : false;
                      
                      // Enrolled nếu: (đã enroll local HOẶC đã enroll từ trước) VÀ chưa unenroll local
                      const isEnrolled = (isLocallyEnrolled || isAlreadyEnrolled) && !isLocallyUnenrolled;

                      return (
                        <tr key={s.id} className="border-t">
                          <td className="hidden lg:table-cell px-3 py-4 text-center whitespace-nowrap">
                            {s.semester ?? '-'}
                          </td>
                          <td className="hidden lg:table-cell px-3 py-4 text-center whitespace-nowrap">
                            {s.academicYear ?? '-'}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {s.dayOfWeek ?? '-'}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {s.startTime ?? '-'} - {s.endTime ?? '-'}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {s.room ?? '-'}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {s.startDate
                              ? new Date(s.startDate).toLocaleDateString()
                              : '-'}{' '}
                            –{' '}
                            {s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="hidden lg:table-cell px-3 py-4 text-center whitespace-nowrap">
                            {s.totalWeeks ?? '-'}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {s._count?.enrollments ?? 0}/{c.maxStudents}
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {isEnrolled ? (
                              <button
                                onClick={() => handleUnenrollClick(s, c.courseName)}
                                disabled={unenrollMutation.isPending}
                                className="bg-red-500 text-white w-full py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {unenrollMutation.isPending ? 'Loading...' : 'Unenroll'}
                              </button>
                            ) : isFull ? (
                              <p className="text-red-500 font-medium">Full</p>
                            ) : (
                              <button
                                className="bg-primary text-primary w-full py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleEnroll(s.id)}
                                disabled={enrollMutation.isPending || !isStudent}
                              >
                                {enrollMutation.isPending ? 'Loading...' : 'Enroll'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
      </div>

      <button
        onClick={() => navigate('/student/courses')}
        className="mx-auto block px-4 py-2 rounded-lg bg-component font-medium hover:opacity-80 transition-opacity"
      >
        Back to courses
      </button>

      {/* Unenroll Modal */}
      <UnenrollModal
        isOpen={showUnenrollModal}
        onClose={() => {
          setShowUnenrollModal(false);
          setSelectedEnrollmentForUnenroll(null);
        }}
        onConfirm={handleUnenrollConfirm}
        isLoading={unenrollMutation.isPending}
        courseName={selectedEnrollmentForUnenroll?.courseName}
        scheduleInfo={selectedEnrollmentForUnenroll?.scheduleInfo}
      />
    </div>
  );
}