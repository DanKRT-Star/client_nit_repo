import { forwardRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, type FieldError } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi, type Course, type CourseSchedule, type CreateCourseData, type CreateScheduleData } from './api';
import { useAuthStore } from '../stores/authStore';

type ScheduleFormData = {
  id?: string;
  semester: string;
  academicYear: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
};

type CourseFormData = {
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  maxStudents: number;
  schedules: ScheduleFormData[];
};

export default function CreateCoursePage() {
  const { courseId } = useParams<{ courseId?: string }>();
  const isEditMode = Boolean(courseId);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    setValue,
  } = useForm<CourseFormData>({
    defaultValues: {
      credits: 3,
      maxStudents: 50,
      schedules: [],
    },
  });

  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const [isSavingSchedules, setIsSavingSchedules] = useState(false);

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control,
    name: 'schedules',
  });

  const { data: courseDetail, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await courseApi.getCourseById(courseId);
      return (response as any)?.data ?? response;
    },
    enabled: isEditMode,
  });

  const { data: scheduleDetail, isLoading: isScheduleLoading } = useQuery({
    queryKey: ['course-schedules', courseId],
    queryFn: async () => {
      if (!courseId) return [] as CourseSchedule[];
      const response = await courseApi.getCourseSchedules(courseId);
      const payload = (response as any)?.data ?? response;
      return Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.schedules)
        ? payload.schedules
        : Array.isArray(payload)
        ? payload
        : [];
    },
    enabled: isEditMode,
  });

  const dayOfWeekOptions = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

const calculateWeeksBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  const diffMs = end.getTime() - start.getTime();
  const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks > 0 ? diffWeeks : 0;
};

useEffect(() => {
  if (!isEditMode || !courseDetail) {
    return;
  }

  const detail = courseDetail as Course;
  const scheduleItems = (scheduleDetail ?? []).map((schedule: CourseSchedule) => ({
    id: schedule.id,
    semester: schedule.semester ?? '',
    academicYear: schedule.academicYear ?? '',
    dayOfWeek: schedule.dayOfWeek ?? 'MONDAY',
    startTime: schedule.startTime ?? '',
    endTime: schedule.endTime ?? '',
    room: schedule.room ?? '',
    startDate: schedule.startDate ? schedule.startDate.slice(0, 10) : '',
    endDate: schedule.endDate ? schedule.endDate.slice(0, 10) : '',
    totalWeeks: schedule.totalWeeks ?? 0,
  }));

  reset({
    courseCode: detail.courseCode ?? '',
    courseName: detail.courseName ?? '',
    description: detail.description ?? '',
    credits: detail.credits ?? 0,
    maxStudents: detail.maxStudents ?? 0,
    schedules: scheduleItems,
  });
}, [isEditMode, courseDetail, scheduleDetail, reset]);

  const handleAddSchedule = () => {
    appendSchedule({
      semester: '',
      academicYear: '',
      dayOfWeek: 'MONDAY',
      startTime: '',
      endTime: '',
      room: '',
      startDate: '',
      endDate: '',
      totalWeeks: 15,
    });
  };

const handleRemoveSchedule = (index: number) => {
  removeSchedule(index);
};

  // Mutation để tạo course với API backend
  const createCourseMutation = useMutation({
    mutationFn: (data: CreateCourseData) => courseApi.createCourse(data),
  });

const isProcessing = createCourseMutation.isPending || isSubmitting || isSavingSchedules;

  const onSubmit = async (data: CourseFormData) => {
  const sanitizedSchedules = (data.schedules ?? [])
    .map((schedule) => ({
      ...schedule,
      totalWeeks: Number(schedule.totalWeeks || 0),
    }))
    .filter((schedule) =>
      schedule.semester &&
      schedule.academicYear &&
      schedule.dayOfWeek &&
      schedule.startTime &&
      schedule.endTime &&
      schedule.room &&
      schedule.startDate &&
      schedule.endDate &&
      schedule.totalWeeks > 0
    );

  if (isEditMode && courseId) {
    setIsSavingSchedules(true);
    try {
      await courseApi.updateCourse(courseId, {
        courseCode: data.courseCode,
        courseName: data.courseName,
        description: data.description,
        credits: Number(data.credits),
        maxStudents: Number(data.maxStudents),
      });

      const schedulesToCreate = sanitizedSchedules.filter((schedule) => !schedule.id);
      const schedulesToUpdate = sanitizedSchedules.filter((schedule) => schedule.id);

      const createPayloads = schedulesToCreate.map(({ id: _id, totalWeeks, ...schedule }) => ({
        courseId,
        semester: schedule.semester,
        academicYear: schedule.academicYear,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room,
        startDate: new Date(schedule.startDate).toISOString(),
        endDate: new Date(schedule.endDate).toISOString(),
        totalWeeks,
      }));

      const updatePayloads = schedulesToUpdate.map((schedule) => ({
        id: schedule.id as string,
        payload: {
          courseId,
          semester: schedule.semester,
          academicYear: schedule.academicYear,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          startDate: new Date(schedule.startDate).toISOString(),
          endDate: new Date(schedule.endDate).toISOString(),
          totalWeeks: schedule.totalWeeks,
        },
      }));

      await Promise.all([
        ...createPayloads.map((payload) => courseApi.createSchedule(payload)),
        ...updatePayloads.map(({ id, payload }) => courseApi.updateSchedule(id, payload)),
      ]);
      alert('Cập nhật khóa học thành công!');
      queryClient.invalidateQueries({ queryKey: ['lecturer-courses'] });
      navigate('/lecturer/courses');
    } catch (err) {
      console.error('Edit course error:', err);
      const errorMessage = (err as any)?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học hoặc lịch học!';
      alert(errorMessage);
    } finally {
      setIsSavingSchedules(false);
    }
    return;
  }

  if (!user?.lecturerId) {
    alert('Không tìm thấy thông tin Lecturer ID. Vui lòng đăng nhập lại!');
    console.error('User object:', user);
    return;
  }

  try {
    const courseData: CreateCourseData = {
      courseCode: data.courseCode,
      courseName: data.courseName,
      description: data.description,
      credits: Number(data.credits),
      maxStudents: Number(data.maxStudents),
      lecturerId: user.lecturerId, // Sử dụng lecturerId từ bảng LECTURER
    };

    const response = await createCourseMutation.mutateAsync(courseData);
    const responseData = (response as any)?.data ?? response;
    const normalizedCourse = responseData?.data ?? responseData;
    const createdCourseId =
      normalizedCourse?.id ??
      normalizedCourse?.courseId ??
      normalizedCourse?.course?.id ??
      normalizedCourse?.data?.id;

    if (!createdCourseId) {
      alert('Tạo khóa học thành công nhưng không lấy được mã khóa học. Vui lòng kiểm tra lại.');
      navigate('/lecturer/courses');
      return;
    }

    if (sanitizedSchedules.length > 0) {
      try {
        const schedulePayloads: CreateScheduleData[] = sanitizedSchedules.map(({ totalWeeks, ...schedule }) => ({
          courseId: createdCourseId,
          semester: schedule.semester,
          academicYear: schedule.academicYear,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          startDate: new Date(schedule.startDate).toISOString(),
          endDate: new Date(schedule.endDate).toISOString(),
          totalWeeks,
        }));

        await Promise.all(schedulePayloads.map((payload) => courseApi.createSchedule(payload)));
        alert('Tạo khóa học và lịch học thành công!');
      } catch (scheduleError) {
        console.error('Create schedule error:', scheduleError);
        const scheduleMessage = (scheduleError as any)?.response?.data?.message || 'Tạo khóa học thành công nhưng lưu lịch học thất bại. Vui lòng thử lại trong phần chỉnh sửa.';
        alert(scheduleMessage);
      }
    } else {
      alert('Tạo khóa học thành công!');
    }

    queryClient.invalidateQueries({ queryKey: ['lecturer-courses'] });
    navigate('/lecturer/courses');
  } catch (err) {
    console.error('Submit error:', err);
    const errorMessage = (err as any)?.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học hoặc lịch học!';
    alert(errorMessage);
  }
  };

if (isEditMode && (isCourseLoading || isScheduleLoading)) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

if (isEditMode && !courseDetail) {
  return (
    <div className="max-w-xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 p-6 rounded-xl">
      Không tìm thấy khóa học hoặc bạn không có quyền chỉnh sửa.
    </div>
  );
}

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-main mb-2">Tạo khóa học mới</h1>
        <p className="text-secondary">Điền thông tin để tạo một khóa học mới cho học viên</p>
      </div>

      {/* Form Card */}
      <div className="bg-surface rounded-2xl shadow-xl p-6 md:p-8 border border-color/50">
        {/* Error Alert */}
        {createCourseMutation.isError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium">
             {(createCourseMutation.error as any)?.response?.data?.message || 'Có lỗi xảy ra!'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div>
            <h2 className="text-xl font-semibold text-main mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H6C4.35 2 3 3.35 3 5v14c0 1.65 1.35 3 3 3h15v-2H6c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-3 9-2-1-2 1V4h4z"/>
              </svg>
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Mã khóa học"
                placeholder="VD: CS101"
                {...register('courseCode', {
                  required: 'Mã khóa học là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: 'Mã khóa học chỉ chứa chữ in hoa và số'
                  }
                })}
                error={errors.courseCode}
                disabled={isProcessing}
              />

              <FormInput
                label="Tên khóa học"
                placeholder="VD: Lập trình React cơ bản"
                {...register('courseName', {
                  required: 'Tên khóa học là bắt buộc',
                  minLength: {
                    value: 5,
                    message: 'Tên khóa học phải có ít nhất 5 ký tự'
                  }
                })}
                error={errors.courseName}
                disabled={isProcessing}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-main mb-2 dark:text-white">
                Mô tả khóa học <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description', {
                  required: 'Mô tả khóa học là bắt buộc',
                  minLength: {
                    value: 20,
                    message: 'Mô tả phải có ít nhất 20 ký tự'
                  }
                })}
                disabled={isProcessing}
                rows={4}
                placeholder="Mô tả chi tiết về nội dung khóa học, mục tiêu, đối tượng học viên..."
                className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all resize-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-300"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Số tín chỉ"
                type="number"
                min="1"
                max="10"
                placeholder="VD: 3"
                {...register('credits', {
                  required: 'Số tín chỉ là bắt buộc',
                  min: { value: 1, message: 'Tối thiểu 1 tín chỉ' },
                  max: { value: 10, message: 'Tối đa 10 tín chỉ' }
                })}
                error={errors.credits}
                disabled={isProcessing}
              />

              <FormInput
                label="Số học viên tối đa"
                type="number"
                min="1"
                max="200"
                placeholder="VD: 50"
                {...register('maxStudents', {
                  required: 'Số học viên tối đa là bắt buộc',
                  min: { value: 1, message: 'Tối thiểu 1 học viên' },
                  max: { value: 200, message: 'Tối đa 200 học viên' }
                })}
                error={errors.maxStudents}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Lịch học */}
          <div className="pt-6 border-t border-dashed border-color space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-main flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.3 3 2 4.3 2 6v14c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zm1 17c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1V10h16v10zm0-12H4V6c0-.6.4-1 1-1h1v2h2V5h8v2h2V5h1c.6 0 1 .4 1 1v2z" />
                  </svg>
                  Lịch học
                </h2>
                <p className="text-sm text-secondary dark:text-gray-300">Thêm các buổi học theo học kỳ, thời gian và phòng học cụ thể.</p>
              </div>
              <button
                type="button"
                onClick={handleAddSchedule}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 px-4 py-2 text-sm font-semibold text-main transition-all hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary/60 dark:text-white dark:hover:bg-primary/20"
              >
                <span className="text-lg">+</span>
                Thêm lịch học
              </button>
            </div>

            {scheduleFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-color/60 bg-component/40 p-6 text-center text-sm text-secondary dark:bg-component/20 dark:text-gray-200">
                Chưa có lịch học nào. Bạn có thể thêm lịch ngay bây giờ hoặc bổ sung sau khi khóa học được tạo.
              </div>
            ) : (
              <div className="space-y-6">
                {scheduleFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-color/60 bg-component/30 p-6 shadow-inner shadow-black/5 dark:bg-component/20"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold text-main dark:text-white">Lịch học #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(index)}
                        disabled={isProcessing || !!field.id}
                        title={!!field.id ? "Chỉ Admin mới có quyền xóa lịch đã lưu" : "Xóa lịch học"}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-500/20"
                      >
                        Xóa lịch này
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Học kỳ</label>
                        <input
                          {...register(`schedules.${index}.semester`, {
                            required: 'Học kỳ là bắt buộc',
                          })}
                          disabled={isProcessing}
                          placeholder="VD: Fall 2024"
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-300"
                        />
                        {errors.schedules?.[index]?.semester && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.semester?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Năm học</label>
                        <input
                          {...register(`schedules.${index}.academicYear`, {
                            required: 'Năm học là bắt buộc',
                          })}
                          disabled={isProcessing}
                          placeholder="VD: 2024-2025"
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-300"
                        />
                        {errors.schedules?.[index]?.academicYear && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.academicYear?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Thứ trong tuần</label>
                        <select
                          {...register(`schedules.${index}.dayOfWeek`, {
                            required: 'Vui lòng chọn thứ trong tuần',
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        >
                          {dayOfWeekOptions.map((day) => (
                            <option
                              key={day}
                              value={day}
                              className="bg-white text-main dark:bg-slate-900 dark:text-white"
                            >
                              {day}
                            </option>
                          ))}
                        </select>
                        {errors.schedules?.[index]?.dayOfWeek && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.dayOfWeek?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Phòng học</label>
                        <input
                          {...register(`schedules.${index}.room`, {
                            required: 'Phòng học là bắt buộc',
                          })}
                          disabled={isProcessing}
                          placeholder="VD: A101"
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-300"
                        />
                        {errors.schedules?.[index]?.room && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.room?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Giờ bắt đầu</label>
                        <input
                          type="time"
                          {...register(`schedules.${index}.startTime`, {
                            required: 'Giờ bắt đầu là bắt buộc',
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        />
                        {errors.schedules?.[index]?.startTime && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.startTime?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Giờ kết thúc</label>
                        <input
                          type="time"
                          {...register(`schedules.${index}.endTime`, {
                            required: 'Giờ kết thúc là bắt buộc',
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        />
                        {errors.schedules?.[index]?.endTime && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.endTime?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Ngày bắt đầu</label>
                        <input
                          type="date"
                          {...register(`schedules.${index}.startDate`, {
                            required: 'Ngày bắt đầu là bắt buộc',
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                          onChange={(event) => {
                            register(`schedules.${index}.startDate`).onChange(event);
                            const current = getValues(`schedules.${index}`);
                            const weeks = calculateWeeksBetween(event.target.value, current?.endDate ?? '');
                            setValue(`schedules.${index}.totalWeeks`, weeks, { shouldValidate: true });
                          }}
                        />
                        {errors.schedules?.[index]?.startDate && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.startDate?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Ngày kết thúc</label>
                        <input
                          type="date"
                          {...register(`schedules.${index}.endDate`, {
                            required: 'Ngày kết thúc là bắt buộc',
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                          onChange={(event) => {
                            register(`schedules.${index}.endDate`).onChange(event);
                            const current = getValues(`schedules.${index}`);
                            const weeks = calculateWeeksBetween(current?.startDate ?? '', event.target.value);
                            setValue(`schedules.${index}.totalWeeks`, weeks, { shouldValidate: true });
                          }}
                        />
                        {errors.schedules?.[index]?.endDate && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.endDate?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-main mb-2 dark:text-white">Tổng số tuần</label>
                        <input
                          type="number"
                          readOnly
                          {...register(`schedules.${index}.totalWeeks`, {
                            required: 'Tổng số tuần là bắt buộc',
                            min: { value: 1, message: 'Tối thiểu 1 tuần' },
                            max: { value: 52, message: 'Tối đa 52 tuần' },
                          })}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-color px-4 py-2.5 text-sm text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 bg-gray-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white cursor-not-allowed"
                        />
                        {errors.schedules?.[index]?.totalWeeks && (
                          <p className="mt-1 text-xs text-red-500">{errors.schedules?.[index]?.totalWeeks?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-color">
            <button
              type="button"
              onClick={() => navigate('/lecturer/courses')}
              disabled={isProcessing}
              className="flex-1 bg-component text-main font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-component/40 dark:text-white dark:hover:bg-component/30"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:shadow-primary/20"
            >
              <span className="relative z-10">
                {createCourseMutation.isPending || isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 dark:via-black/10"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** FormInput component with react-hook-form integration */
const FormInput = forwardRef<HTMLInputElement, {
  label: string;
  type?: string;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, type = 'text', error, disabled = false, placeholder, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-main mb-2 dark:text-white">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-white border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-300"
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        )}
      </div>
    );
  }
);

