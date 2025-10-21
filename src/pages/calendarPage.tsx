import { useState, useMemo } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const handleNextWeek = () => setCurrentDate(currentDate.add(1, "week"));
  const handlePrevWeek = () => setCurrentDate(currentDate.subtract(1, "week"));
  const handleMonthChange = (month: number) => {
    const newDate = currentDate.month(month);
    setCurrentDate(newDate);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <CalendarHeader
        currentDate={currentDate}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        onMonthChange={handleMonthChange}
      />
      <CalendarGrid currentDate={currentDate} />
    </div>
  );
}

//Calendar head
interface CalendarHeaderProps {
  currentDate: dayjs.Dayjs;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onMonthChange: (monthIndex: number) => void;
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
  const currentMonth = currentDate.month();

  return (
    <div className="flex justify-between items-center bg-surface py-3 shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevWeek}
          className="px-2 py-1 bg-background rounded-md hover:bg-component"
        >
          {"<"}
        </button>
        <button
          onClick={onNextWeek}
          className="px-2 py-1 bg-background rounded-md hover:bg-component"
        >
          {">"}
        </button>

        <div className="flex items-center ml-2 space-x-2">
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="bg-background border rounded-md px-2 py-1 text-sm focus:outline-none"
          >
            {months.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>

          <h2 className="text-lg font-semibold">{range}</h2>
        </div>
      </div>

      <div className="space-x-2">
        <button className="px-3 py-1 rounded-md border hover:bg-component">
          Day
        </button>
        <button className="px-3 py-1 rounded-md border hover:bg-component">
          Week
        </button>
        <button className="px-3 py-1 rounded-md border hover:bg-component">
          Month
        </button>
      </div>
    </div>
  );
};

//Calendar body
interface CalendarGridProps {
  currentDate: dayjs.Dayjs;
}

const HEADER_HEIGHT = 60;

interface Task {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate }) => {
  const startOfWeek = currentDate.startOf("isoWeek");
  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
    [startOfWeek]
  );

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  const now = dayjs();
  const isCurrentWeek = now.isAfter(startOfWeek) && now.isBefore(startOfWeek.add(7, "day"));
  const currentMinutes = now.hour() * 60 + now.minute();

  const tasks: Task[] = [
    {
      id: 1,
      title: "Morning Meeting",
      startTime: dayjs().startOf("week").add(1, "day").hour(9).minute(0).toISOString(), // Monday 9:00
      endTime: dayjs().startOf("week").add(1, "day").hour(10).minute(0).toISOString(),
    },
    {
      id: 2,
      title: "Design Review",
      startTime: dayjs().startOf("week").add(3, "day").hour(13).minute(30).toISOString(), // Wednesday
      endTime: dayjs().startOf("week").add(3, "day").hour(15).minute(0).toISOString(),
    },
    {
      id: 3,
      title: "Project Presentation",
      startTime: dayjs().startOf("week").add(4, "day").hour(10).minute(0).toISOString(), // Thursday
      endTime: dayjs().startOf("week").add(4, "day").hour(12).minute(0).toISOString(),
    },
  ];

  return (
    <div className="flex flex-1">
      {/*hour column */}
      <div className="w-fit flex-shrink-0 border-r text-xs">
        <div style={{ height: HEADER_HEIGHT }} />
        {hours.map((hour) => (
          <div key={hour} className="h-[60px] text-right mr-1">
            {hour}
          </div>
        ))}
      </div>

      {/*Week column */}
      <div className="flex flex-1 relative">
        {/*Days of week*/}
        {daysOfWeek.map((day) => (
          <div key={day.toString()} className="flex-1 border-r relative min-w-0">
            <div
              className="border-b text-center py-2"
              style={{ height: HEADER_HEIGHT }}
            >
              <div className="font-medium text-sm">{day.format("ddd")}</div>
              <div className={`text-lg ${day.isSame(now, "day") ? "font-bold" : ""}`}>
                {day.format("D")}
              </div>
            </div>

            {/* hour frame */}
            {hours.map((_, i) => (
              <div key={i} className="h-[60px] border-b hover:bg-component" />
            ))}

            {/* Task on table*/}
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
                    className="absolute left-0 right-0 border-l-8 bg-background border-blue-400 rounded-md p-2 shadow-xl hover:shadow-2xl flex flex-col"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="flex-1 flex items-end justify-end">
                      {start.format("HH:mm")} - {end.format("HH:mm")}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

        {/*Timeline*/}
        {isCurrentWeek && (() => {
          const currentDayIndex = now.isoWeekday() - 1;
          const columnWidth = 100 / 7;
          const pastRightPercent = 100 - currentDayIndex * columnWidth;
          const todayLeftPercent = currentDayIndex * columnWidth;
          const todayRightPercent = 100 - (currentDayIndex + 1) * columnWidth;
          const topPos = HEADER_HEIGHT + currentMinutes;

          return (
            <>
              {/* Nét đứt (ngày cũ) */}
              <div
                className="absolute border-t-2 border-blue-700 border-dashed"
                style={{
                  top: `${topPos}px`,
                  left: 0,
                  right: `${pastRightPercent}%`,
                }}
              />

              {/* Nét liền (ngày hiện tại) */}
              <div
                className="absolute border-t-2 border-blue-700"
                style={{
                  top: `${topPos}px`,
                  left: `${todayLeftPercent}%`,
                  right: `${todayRightPercent}%`,
                }}
              />

              <div
                className="absolute bg-blue-700 w-2 h-2 rounded-full"
                style={{
                  top: `${topPos - 3}px`,
                  left: `calc(${todayLeftPercent}% - 4px)`,
                }}
              />
              <div
                className="absolute bg-blue-700 w-2 h-2 rounded-full"
                style={{
                  top: `${topPos - 3}px`,
                  right: `calc(${todayRightPercent}% - 4px)`,
                }}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
};
