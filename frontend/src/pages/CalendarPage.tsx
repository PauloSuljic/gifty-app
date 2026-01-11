import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiGift } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { getSharedWithMe, SharedWithMeGroup } from "../shared/lib/sharedLinks";
import { useNavigate } from "react-router-dom";

interface EventItem {
  id: string;
  name: string;
  type: "birthday" | "gift";
  date: Date;
  daysLeft: number;
}

const hasDateOfBirth = (
  user: SharedWithMeGroup
): user is SharedWithMeGroup & { ownerDateOfBirth: string } =>
  typeof user.ownerDateOfBirth === "string" && user.ownerDateOfBirth.length > 0;

function calculateDaysUntilBirthday(dateString: string): number {
  const today = new Date();
  const birthday = new Date(dateString);
  birthday.setFullYear(today.getFullYear());
  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = birthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const occursOn = (eventDate: Date, day: Date) =>
  eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate();

export default function CalendarPage() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
  if (!firebaseUser) return;

  const fetchSharedUsers = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const data = await getSharedWithMe(token);
      const fetchedEvents: EventItem[] = data
        .filter(hasDateOfBirth)
        .map((user): EventItem => ({
          id: user.ownerId,
          name: user.ownerName,
          type: "birthday",
          date: new Date(user.ownerDateOfBirth),
          daysLeft: calculateDaysUntilBirthday(user.ownerDateOfBirth),
        }))
        .sort((a, b) => a.daysLeft - b.daysLeft);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Failed to fetch shared users:", error);
    }
  }

  fetchSharedUsers();
}, [firebaseUser]);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const hasEvent = (date: Date) =>
    events.some((event) => occursOn(event.date, date));

  // Weekdays starting Monday
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Reorder monthDays so that the calendar starts on Monday
  // We will pad the first week with previous month's days to align Monday start
  const startDay = startOfMonth(currentDate).getDay(); // 0 (Sun) to 6 (Sat)
  // Calculate how many days to prepend from previous month to start on Monday
  const prependDaysCount = (startDay === 0 ? 6 : startDay - 1);

  // Get days from previous month to prepend
  const prevMonthEndDay = endOfMonth(subMonths(currentDate, 1));

  const prependDays = [];
  for (let i = prependDaysCount; i > 0; i--) {
    prependDays.push(new Date(prevMonthEndDay.getFullYear(), prevMonthEndDay.getMonth(), prevMonthEndDay.getDate() - i + 1));
  }

  // Combine days for calendar grid
  const calendarDays = [...prependDays, ...monthDays];

  // Filter events for selectedDate
  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => occursOn(event.date, selectedDate))
    : [];

  const upcomingEventsLimited = !selectedDate
    ? events.slice(0, 3)
    : eventsForSelectedDate;

  return (
    <>
      <div className="min-h-screen text-gray-200 pt-4 px-2">
        <h2 className="text-xl sm:text-3xl font-semibold pb-6 text-center">Calendar</h2>
        {/* Calendar card */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-600/20">
              <FiChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-600/20">
              <FiChevronRight size={18} />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 text-center text-gray-400 text-sm mb-2">
            {weekdays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center gap-y-1.5">
            {calendarDays.map((day: Date, index) => {
              const today = isSameDay(day, new Date());
              const eventDay = hasEvent(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

              return (
                <div
                  key={day.toISOString() + index}
                  onClick={() => {
                    setSelectedDate(day);
                  }}
                  className={`flex flex-col items-center justify-center w-10 h-10 mx-auto rounded-lg text-sm cursor-pointer select-none ${
                    isSelected ? "bg-purple-500 text-white" : today ? "border border-purple-400" : ""
                  } ${eventDay ? "relative" : ""} ${!isCurrentMonth ? "text-gray-600" : ""}`}
                >
                  {format(day, "d")}
                  {eventDay && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events or Filtered Events */}
        <section>
          {selectedDate && eventsForSelectedDate.length > 0 && (
            <h3 className="text-gray-300 text-sm mb-3">
              Events for {format(selectedDate, "MMMM d, yyyy")}
            </h3>
          )}
          {selectedDate && eventsForSelectedDate.length === 0 && (
            <h3 className="text-gray-300 text-sm mb-3">
              No events for this date
            </h3>
          )}
          {!selectedDate && (
            <h3 className="text-gray-300 text-sm mb-3">
              Upcoming Events
            </h3>
          )}
          <div className="space-y-3">
            {upcomingEventsLimited.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate("/shared-with-me", { state: { highlightUserId: event.id } })}
                className="flex justify-between items-center bg-gray-700/50 rounded-xl p-3 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-600/20 p-2 rounded-full">
                    <FiGift size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-gray-400">
                      {event.type === "birthday" ? "Birthday" : "Anniversary gift"} •{" "}
                      {event.daysLeft} days
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {format(event.date, "MMM d")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
