import { useState, useMemo } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const handleNextWeek = () => setCurrentDate(currentDate.add(1, "week"));
  const handlePrevWeek = () => setCurrentDate(currentDate.subtract(1, "week"));
  const handleMonthChange = (month: number) => setCurrentDate(currentDate.month(month));

  return (
    <section className="flex flex-col p-4 h-full bg-surface">
      <CalendarHeader
        currentDate={currentDate}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        onMonthChange={handleMonthChange}
      />
      <CalendarGrid currentDate={currentDate} />
    </section>
  );
}

type CalendarDateProps = {
  currentDate: dayjs.Dayjs;
};

/* === Calendar Header === */
interface CalendarHeaderProps extends CalendarDateProps {
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onMonthChange: (month: number) => void;
}


const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onNextWeek,
  onPrevWeek,
  onMonthChange,
}) => {
  const startOfWeek = currentDate.startOf("isoWeek");
  const endOfWeek = startOfWeek.add(6, "day");
  const range = `${startOfWeek.format("D")} – ${endOfWeek.format("D, YYYY")}`;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <header className="flex justify-between items-center bg-background py-3 px-4 rounded-md shadow-sm mb-2">
      <div className="flex items-center gap-2">
        <button onClick={onPrevWeek} className="px-2 py-1 bg-surface rounded hover:bg-component">{'<'}</button>
        <button onClick={onNextWeek} className="px-2 py-1 bg-surface rounded hover:bg-component">{'>'}</button>

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
          <h2 className="text-lg font-semibold">{range}</h2>
        </div>
      </div>

      <div className="space-x-2">
        {["Day", "Week", "Month"].map((view) => (
          <button key={view} className="px-3 py-1 border rounded hover:bg-component">
            {view}
          </button>
        ))}
      </div>
    </header>
  );
}

/* === Calendar Grid === */
const CalendarGrid: React.FC<CalendarDateProps> = ({ currentDate }) => {
  const HEADER_HEIGHT = 60;
  const startOfWeek = currentDate.startOf("isoWeek");
  const now = dayjs();
  const isCurrentWeek = now.isAfter(startOfWeek) && now.isBefore(startOfWeek.add(7, "day"));
  const currentMinutes = now.hour() * 60 + now.minute();

  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
    [startOfWeek]
  );
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  // === Hard database (sample tasks) ===
  const tasks = [
    {
      id: 1,
      title: "Morning Meeting",
      startTime: dayjs().startOf("week").add(1, "day").hour(9).minute(0).toISOString(),
      endTime: dayjs().startOf("week").add(1, "day").hour(10).minute(0).toISOString(),
    },
    {
      id: 2,
      title: "Design Review",
      startTime: dayjs().startOf("week").add(3, "day").hour(13).minute(30).toISOString(),
      endTime: dayjs().startOf("week").add(3, "day").hour(15).minute(0).toISOString(),
    },
    {
      id: 3,
      title: "Project Presentation",
      startTime: dayjs().startOf("week").add(4, "day").hour(10).minute(0).toISOString(),
      endTime: dayjs().startOf("week").add(4, "day").hour(12).minute(0).toISOString(),
    },
  ];

  return (
    <div className="flex flex-1 overflow-y-auto">
      {/* Hour Column */}
      <div className="w-fit flex-shrink-0 border-r text-xs bg-surface">
        <div style={{ height: HEADER_HEIGHT }} />
        {hours.map((hour) => (
          <div key={hour} className="h-[60px] text-right pr-1">{hour}</div>
        ))}
      </div>

      {/* Week Column */}
      <div className="flex flex-1 relative">
        {daysOfWeek.map((day) => (
          <div key={day.toString()} className="flex-1 border-r relative">
            <div className="border-b text-center py-2 bg-background" style={{ height: HEADER_HEIGHT }}>
              <div className="font-medium text-sm">{day.format("ddd")}</div>
              <div className={`text-lg ${day.isSame(now, "day") ? "font-bold" : ""}`}>
                {day.format("D")}
              </div>
            </div>

            {/* Hour slots */}
            {hours.map((_, i) => (
              <div key={i} className="h-[60px] border-b hover:bg-component transition-colors" />
            ))}

            {/* Tasks */}
            {tasks
              .filter((task) => dayjs(task.startTime).isSame(day, "day"))
              .map((task) => {
                const start = dayjs(task.startTime);
                const end = dayjs(task.endTime);
                const top = HEADER_HEIGHT + start.hour() * 60 + start.minute();
                const height = end.diff(start, "minute");

                return (
                  <div
                    key={task.id}
                    className="absolute left-0 right-0 border-l-8 border-blue-400 bg-background rounded-md p-2 shadow-md hover:shadow-lg text-sm"
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-xs text-secondary mt-auto">
                      {start.format("HH:mm")} – {end.format("HH:mm")}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

        {/* === Timeline (Hiện tại) === */}
        {isCurrentWeek && (() => {
          const currentDayIndex = now.isoWeekday() - 1;
          const columnWidth = 100 / 7;
          const topPos = HEADER_HEIGHT + currentMinutes;
          const leftPercent = currentDayIndex * columnWidth;
          const rightPercent = 100 - (currentDayIndex + 1) * columnWidth;

          return (
            <>
              {/* Net đứt phần ngày cũ */}
              <div
                className="absolute border-t-2 border-blue-700 border-dashed"
                style={{
                  top: `${topPos}px`,
                  left: 0,
                  right: `${100 - currentDayIndex * columnWidth}%`,
                }}
              />
              {/* Net liền phần ngày hiện tại */}
              <div
                className="absolute border-t-2 border-blue-700"
                style={{
                  top: `${topPos}px`,
                  left: `${leftPercent}%`,
                  right: `${rightPercent}%`,
                }}
              />
              {/* 2 đầu chấm tròn */}
              <div
                className="absolute bg-blue-700 w-2 h-2 rounded-full"
                style={{ top: `${topPos - 3}px`, left: `calc(${leftPercent}% - 4px)` }}
              />
              <div
                className="absolute bg-blue-700 w-2 h-2 rounded-full"
                style={{ top: `${topPos - 3}px`, right: `calc(${rightPercent}% - 4px)` }}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}
