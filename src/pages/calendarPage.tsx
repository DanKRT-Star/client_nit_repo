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
    <div className="flex flex-col h-full bg-gray-50">
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
    <div className="flex justify-between items-center bg-white px-6 py-3 border-b border-gray-300 shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevWeek}
          className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {"<"}
        </button>
        <button
          onClick={onNextWeek}
          className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {">"}
        </button>

        <div className="flex items-center ml-2 space-x-2">
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {months.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>

          <h2 className="text-lg font-semibold text-gray-700">{range}</h2>
        </div>
      </div>

      <div className="space-x-2">
        <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
          Day
        </button>
        <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 bg-blue-100">
          Week
        </button>
        <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
          Month
        </button>
      </div>
    </div>
  );
};

interface CalendarGridProps {
  currentDate: dayjs.Dayjs;
}

const HEADER_HEIGHT = 60;

interface CalendarGridProps {
  currentDate: dayjs.Dayjs;
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

  return (
    <div className="flex flex-1 overflow-auto border-t border-gray-200" style={{ minHeight: 0 }}>
      <div className="w-[70px] flex-shrink-0 border-r border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div style={{ height: HEADER_HEIGHT }} className="border-b border-gray-200" />
          {hours.map((hour) => (
            <div key={hour} className="h-[60px] pr-2 text-right flex items-start">
              {hour}
            </div>
          ))}
      </div>

      <div className="flex flex-1 relative">
        {daysOfWeek.map((day) => (
          <div key={day.toString()} className="flex-1 border-r border-gray-200 relative min-w-0">
            <div
              className="sticky top-0 z-10 bg-white border-b border-gray-200 text-center py-2"
              style={{ height: HEADER_HEIGHT }}
            >
              <div className="font-medium text-sm">{day.format("ddd")}</div>
              <div className={`text-lg ${day.isSame(now, "day") ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                {day.format("D")}
              </div>
            </div>

            {hours.map((_, i) => (
              <div key={i} className="h-[60px] border-b border-gray-100 hover:bg-blue-50 transition" />
            ))}
          </div>
        ))}

        {isCurrentWeek && (
          <div
            className="absolute left-0 right-0 h-[2px] bg-blue-500"
            style={{ top: `${HEADER_HEIGHT + currentMinutes}px` }}
          />
        )}
      </div>
    </div>
  );
};
