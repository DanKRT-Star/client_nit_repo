import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import { useMyEnrollments } from "../hooks/useCourseQuery";
import type { Enrollment } from "../api/courseApi";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type CalendarView = "Day" | "Week" | "Month";

export default function CalendarPage() {
  // ... (Không thay đổi)
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState<CalendarView>("Week");

  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 1024) {
        setView("Day");
      } else {
        setView("Week");
      }
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const handleNext = () => {
    const unit = view === "Week" ? "week" : "day";
    setCurrentDate(currentDate.add(1, unit));
  };

  const handlePrev = () => {
    const unit = view === "Week" ? "week" : "day";
    setCurrentDate(currentDate.subtract(1, unit));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(currentDate.month(month));
  };

  return (
    <section className="flex flex-col p-4 h-full bg-surface">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        onNext={handleNext}
        onPrev={handlePrev}
        onMonthChange={handleMonthChange}
      />
      <CalendarGrid currentDate={currentDate} view={view} />
    </section>
  );
}

// ... (CalendarHeader không thay đổi)
interface CalendarHeaderProps {
  currentDate: dayjs.Dayjs;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  onNext: () => void;
  onPrev: () => void;
  onMonthChange: (month: number) => void;
}
type CalendarDateProps = {
  currentDate: dayjs.Dayjs;
  view: CalendarView;
};
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  onNext,
  onPrev,
  onMonthChange,
}) => {
  const range = useMemo(() => {
    if (view === "Week") {
      const startOfWeek = currentDate.startOf("isoWeek");
      const endOfWeek = startOfWeek.add(6, "day");
      if (startOfWeek.month() !== endOfWeek.month()) {
        return `${startOfWeek.format("D MMM")} – ${endOfWeek.format("D MMM, YYYY")}`;
      }
      return `${startOfWeek.format("D")} – ${endOfWeek.format("D, MMM YYYY")}`;
    }
    return currentDate.format("D MMMM, YYYY");
  }, [currentDate, view]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center bg-background py-3 px-4 rounded-md shadow-lg mb-2 gap-3">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="px-2 py-1 bg-surface rounded hover:bg-component">{'<'}</button>
        <button onClick={onNext} className="px-2 py-1 bg-surface rounded hover:bg-component">{'>'}</button>

        <div className="flex items-center gap-2 ml-2">
          <select
            value={currentDate.month()}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="bg-surface border rounded-md px-2 py-1 text-sm"
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <h2 className="text-lg font-semibold whitespace-nowrap">{range}</h2>
        </div>
      </div>

      <div className="space-x-2">
        {(["Day", "Week", "Month"] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            disabled={v === "Month"}
            className={`px-3 py-1 border rounded transition-colors
              ${view === v ? "bg-primary text-primary" : "hover:bg-component"}
              ${v === "Month" ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {v}
          </button>
        ))}
      </div>
    </header>
  );
};

/* === Calendar Grid === */
const CalendarGrid: React.FC<CalendarDateProps> = ({ currentDate, view }) => {
  const HEADER_HEIGHT = 60;
  const now = dayjs();

  const { 
    data: enrollments, 
    isLoading, 
    error 
  } = useMyEnrollments('ENROLLED');

  const daysToDisplay = useMemo(() => {
    if (view === "Week") {
      const startOfWeek = currentDate.startOf("isoWeek");
      return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
    }
    return [currentDate];
  }, [currentDate, view]);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  
  const dayMap: { [key: string]: number } = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };

  // Thay đổi: Cập nhật useMemo để lọc theo ngày
  const tasks = useMemo(() => {
    if (!enrollments) return [];

    const startOfWeek = currentDate.startOf("isoWeek");

    // Xử lý cho Week view
    if (view === 'Week') {
      // Dùng reduce (hoặc flatMap) để lọc và biến đổi trong 1 lần lặp
      return (enrollments as Enrollment[]).reduce((acc, enroll) => {
        const { schedule } = enroll;
        const { course } = schedule;

        // 1. Kiểm tra xem schedule có ngày bắt đầu/kết thúc không
        if (!schedule.startDate || !schedule.endDate) {
          return acc; // Bỏ qua nếu không có dữ liệu ngày
        }
        
        const courseStart = dayjs(schedule.startDate);
        const courseEnd = dayjs(schedule.endDate);

        // 2. Tìm ngày cụ thể trên lịch cho môn học này
        const dayIndex = dayMap[schedule.dayOfWeek.toUpperCase()] || 1;
        const scheduleDate = startOfWeek.isoWeekday(dayIndex);

        // 3. *** LOGIC LỌC MỚI ***
        // Kiểm tra xem ngày trên lịch (scheduleDate) có nằm trong khoảng [courseStart, courseEnd] không
        const isWithinRange = 
          scheduleDate.isSameOrAfter(courseStart, 'day') &&
          scheduleDate.isSameOrBefore(courseEnd, 'day');

        // 4. Nếu nằm trong khoảng, mới tạo task
        if (isWithinRange) {
          const [startHour, startMin] = schedule.startTime.split(':').map(Number);
          const [endHour, endMin] = schedule.endTime.split(':').map(Number);

          const startTimeIso = scheduleDate.hour(startHour).minute(startMin).second(0).toISOString();
          const endTimeIso = scheduleDate.hour(endHour).minute(endMin).second(0).toISOString();

          acc.push({
            id: enroll.id,
            title: course.courseName,
            room: schedule.room,
            startTime: startTimeIso,
            endTime: endTimeIso,
          });
        }
        
        return acc;
      }, [] as any[]); // Khởi tạo mảng rỗng
    }

    // Xử lý cho Day view
    const currentDayOfWeek = currentDate.isoWeekday(); // 1-7
    const currentDayString = Object.keys(dayMap).find(key => dayMap[key] === currentDayOfWeek);

    return (enrollments as Enrollment[])
      .filter(enroll => {
        const { schedule } = enroll;
        
        // 1. Lọc theo ngày trong tuần (ví dụ: chỉ lấy MONDAY)
        const isCorrectDay = schedule.dayOfWeek.toUpperCase() === currentDayString;
        if (!isCorrectDay) return false;

        // 2. *** LOGIC LỌC MỚI ***
        // Kiểm tra xem ngày đang xem (currentDate) có nằm trong khoảng [courseStart, courseEnd] không
        if (!schedule.startDate || !schedule.endDate) {
          return false; // Bỏ qua nếu không có dữ liệu ngày
        }
        const courseStart = dayjs(schedule.startDate);
        const courseEnd = dayjs(schedule.endDate);

        const isWithinRange = 
          currentDate.isSameOrAfter(courseStart, 'day') &&
          currentDate.isSameOrBefore(courseEnd, 'day');

        return isWithinRange; // Trả về true chỉ khi đúng ngày VÀ trong khoảng
      })
      .map((enroll) => {
        // Logic map giữ nguyên
        const { schedule } = enroll;
        const { course } = schedule;
        
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        
        const startTimeIso = currentDate.hour(startHour).minute(startMin).second(0).toISOString();
        const endTimeIso = currentDate.hour(endHour).minute(endMin).second(0).toISOString();
        
        return {
          id: enroll.id,
          title: course.courseName,
          room: schedule.room,
          startTime: startTimeIso,
          endTime: endTimeIso,
        };
      });

  }, [enrollments, currentDate, view]); 

  const currentMinutes = now.hour() * 60 + now.minute();
  const isVisibleWeek = view === 'Week' && now.isAfter(currentDate.startOf('isoWeek')) && now.isBefore(currentDate.startOf('isoWeek').add(7, 'day'));
  const isVisibleDay = view === 'Day' && currentDate.isSame(now, 'day');
  
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-background rounded-md shadow-lg">
        <AiOutlineLoading3Quarters className="animate-spin text-2xl text-primary" />
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-red-50 text-red-700 rounded-md shadow-sm p-4">
        <BiErrorCircle className="text-4xl" />
        <span className="mt-2 font-semibold">Failed to load schedule</span>
        <p className="text-sm">{(error as Error).message || "Please try again later."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-y-auto rounded-md shadow-sm">
      <div className="w-fit flex-shrink-0 border-r text-xs sticky left-0 z-10">
        <div style={{ height: HEADER_HEIGHT }} />
        {hours.map((hour) => (
          <div key={hour} className="h-[60px] text-right pr-1 pt-1 border-t">{hour}</div>
        ))}
      </div>

      <div className="flex flex-1 relative overflow-x-auto">
        {daysToDisplay.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 border-r relative min-w-full lg:min-w-0"
            style={{ flexBasis: view === 'Week' ? `${100/7}%` : '100%' }}
          >
            <div className="border-b text-center py-2 sticky top-0 z-10" style={{ height: HEADER_HEIGHT }}>
              <div className="font-medium text-sm">{day.format("ddd")}</div>
              <div className={`text-xl ${day.isSame(now, "day") ? "font-bold" : ""}`}>
                {day.format("D")}
              </div>
            </div>

            {hours.map((_, i) => (
              <div key={i} className="h-[60px] border-b hover:bg-component transition-colors" />
            ))}

            {tasks
              .filter((task) => dayjs(task.startTime).isSame(day, "day"))
              .map((task) => {
                const start = dayjs(task.startTime);
                const end = dayjs(task.endTime);
                const top = HEADER_HEIGHT + start.hour() * 60 + start.minute();
                const duration = end.diff(start, "minute");
                const height = Math.max(duration, 45);

                return (
                  <div
                    key={task.id}
                    className="absolute left-1 right-1 border-l-4 border-blue-700 bg-background rounded p-2 shadow-lg text-sm overflow-hidden flex flex-col"
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <div className="font-semibold line-clamp-2">{task.title}</div>
                    <div className="text-xs font-medium mt-1">
                      Phòng: {task.room}
                    </div>
                    <div className="mt-auto">
                      {start.format("HH:mm")} – {end.format("HH:mm")}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

        {(isVisibleWeek || isVisibleDay) && (() => {
          const currentDayIndex = view === 'Week' ? now.isoWeekday() - 1 : 0;
          const columnCount = daysToDisplay.length;
          const columnWidth = 100 / columnCount;

          const topPos = HEADER_HEIGHT + currentMinutes;
          const leftPercent = currentDayIndex * columnWidth;
          const rightPercent = 100 - (currentDayIndex + 1) * columnWidth;

          return (
            <>
              {view === 'Week' && currentDayIndex > 0 && (
                <div
                  className="absolute border-t-2 border-blue-700 border-dashed"
                  style={{
                    top: `${topPos}px`,
                    left: 0,
                    right: `${100 - currentDayIndex * columnWidth}%`,
                    zIndex: 20,
                  }}
                />
              )}
              <div
                className="absolute border-t-2 border-blue-700"
                style={{
                  top: `${topPos}px`,
                  left: `${leftPercent}%`,
                  right: `${rightPercent}%`,
                  zIndex: 20,
                }}
              />
              <div
                className="absolute bg-blue-700 w-2.5 h-2.5 rounded-full"
                style={{ top: `${topPos - 4}px`, left: `calc(${leftPercent}%)`, zIndex: 21 }}
              />
              <div
                className="absolute bg-blue-700 w-2.5 h-2.5 rounded-full"
                style={{ top: `${topPos - 4}px`, right: `calc(${rightPercent}%)`, zIndex: 21 }}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}