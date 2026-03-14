import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { FiChevronLeft, FiChevronRight, FiGift } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { calculateDaysUntilBirthday } from "../shared/lib/birthdays";
import { getSharedWithMe, SharedWithMeGroup } from "../shared/lib/sharedLinks";

type BirthdayEvent = {
  id: string;
  name: string;
  date: Date;
  daysLeft: number;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hasDateOfBirth = (
  user: SharedWithMeGroup
): user is SharedWithMeGroup & { ownerDateOfBirth: string } =>
  typeof user.ownerDateOfBirth === "string" && user.ownerDateOfBirth.length > 0;

const occursOn = (eventDate: Date, day: Date) =>
  eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate();

export default function CalendarPage() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobileUpcomingOpen, setIsMobileUpcomingOpen] = useState(false);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1280px)").matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateViewport = (event: MediaQueryListEvent) => {
      setIsDesktopSidebar(event.matches);
    };

    setIsDesktopSidebar(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setEvents([]);
      setIsLoadingEvents(false);
      return;
    }

    const fetchBirthdayEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const token = await firebaseUser.getIdToken();
        const data = await getSharedWithMe(token);

        const fetchedEvents = data
          .filter(hasDateOfBirth)
          .map((user) => {
            const daysLeft = calculateDaysUntilBirthday(user.ownerDateOfBirth);
            if (daysLeft == null) {
              return null;
            }

            return {
              id: user.ownerId,
              name: user.ownerName,
              date: new Date(user.ownerDateOfBirth),
              daysLeft,
            };
          })
          .filter((event): event is BirthdayEvent => event !== null)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch birthday events:", error);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchBirthdayEvents();
  }, [firebaseUser]);

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
      }),
    [currentDate]
  );

  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => occursOn(event.date, selectedDate))
    : [];

  const panelEvents = selectedDate ? eventsForSelectedDate : events.slice(0, 4);
  const panelTitle = selectedDate ? format(selectedDate, "MMMM d") : "Upcoming";
  const panelDescription = selectedDate
    ? eventsForSelectedDate.length > 0
      ? "Events on the selected day"
      : "No birthdays on this day"
    : "Next birthdays from your friends";

  const showToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setIsMobileUpcomingOpen(false);
  };

  const handleDaySelect = (day: Date) => {
    setIsMobileUpcomingOpen(false);
    setSelectedDate(day);
  };

  const closeMobileModal = () => {
    setSelectedDate(null);
    setIsMobileUpcomingOpen(false);
  };

  const mobileModalEvents = selectedDate ? eventsForSelectedDate : events.slice(0, 4);
  const mobileModalTitle = selectedDate ? format(selectedDate, "MMMM d") : "Upcoming";
  const mobileModalDescription = selectedDate
    ? eventsForSelectedDate.length > 0
      ? "Birthdays on the selected day"
      : "No birthdays on this day"
    : "Next birthdays from your friends";

  return (
    <div className="px-2 pt-4 text-gray-200">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2 px-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Calendar</h1>
          <p className="text-sm text-gray-400 sm:text-base">
            Never miss a friend&apos;s birthday.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.9fr_0.9fr]">
          <div className="rounded-3xl border border-gray-700/70 bg-gray-800/80 p-5 shadow-lg sm:p-6 xl:p-5">
            <div className="mb-6 flex items-center justify-between gap-3 xl:mb-5">
              <div className="flex min-w-0 items-center gap-3">
                <h2 className="text-2xl font-semibold text-white xl:text-xl">
                  <span className="sm:hidden">{format(currentDate, "MMM yyyy")}</span>
                  <span className="hidden sm:inline">{format(currentDate, "MMMM yyyy")}</span>
                </h2>
                <button
                  type="button"
                  onClick={showToday}
                  className="rounded-xl border border-gray-700 bg-gray-900/70 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-900 xl:px-2.5 xl:py-1.5 xl:text-xs"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDate((prev) => subMonths(prev, 1));
                    setSelectedDate(null);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-900/70 text-gray-300 transition hover:border-gray-600 hover:bg-gray-900 hover:text-white xl:h-9 xl:w-9"
                  aria-label="View previous month"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDate((prev) => addMonths(prev, 1));
                    setSelectedDate(null);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-900/70 text-gray-300 transition hover:border-gray-600 hover:bg-gray-900 hover:text-white xl:h-9 xl:w-9"
                  aria-label="View next month"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 sm:gap-2.5 xl:gap-1.5 xl:text-[11px]">
              {weekdayLabels.map((weekday) => (
                <div key={weekday} className="py-2 xl:py-1.5">
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-2.5 xl:gap-1.5">
              {calendarDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const eventCount = events.filter((event) => occursOn(event.date, day)).length;
                const hasEvent = eventCount > 0;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    aria-label={`${format(day, "EEEE, MMMM d, yyyy")}${
                      eventCount > 0
                        ? `, ${eventCount} birthday${eventCount === 1 ? "" : "s"}`
                        : ", no birthdays"
                    }`}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    className={`relative aspect-square rounded-2xl border text-sm font-medium transition xl:aspect-auto xl:h-[4.65rem] xl:rounded-[1rem] xl:text-[15px] ${
                      isSelected
                        ? "border-purple-400 bg-purple-500/30 text-white shadow-[0_0_0_1px_rgba(167,139,250,0.4)]"
                        : isToday
                          ? "border-purple-400/70 bg-gray-900/85 text-white"
                          : hasEvent
                            ? "border-purple-500/30 bg-purple-500/10 text-white hover:border-purple-400/50 hover:bg-purple-500/15"
                            : "border-gray-800 bg-gray-900/70 text-gray-200 hover:border-gray-700 hover:bg-gray-900"
                    } ${!isCurrentMonth ? "text-gray-600" : ""}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-base sm:inset-auto sm:left-3 sm:top-3 sm:text-sm">
                      {format(day, "d")}
                    </span>
                    {eventCount > 1 && (
                      <span className="absolute bottom-2 right-2 hidden min-w-5 items-center justify-center rounded-full bg-purple-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-purple-100 sm:inline-flex">
                        {eventCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 xl:hidden">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  setIsMobileUpcomingOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-900"
              >
                <FiGift size={16} className="text-purple-300" />
                View upcoming birthdays
              </button>
            </div>
          </div>

          <aside className="hidden space-y-4 xl:block">
            <section className="rounded-3xl border border-gray-700/70 bg-gray-800/80 p-5 shadow-lg sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{panelTitle}</h2>
                    <p className="text-sm text-gray-400">{panelDescription}</p>
                  </div>
                </div>

                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="rounded-xl border border-gray-700 bg-gray-900/70 px-3 py-2 text-xs font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-900"
                  >
                    Show upcoming
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {isLoadingEvents ? (
                  <Spinner />
                ) : panelEvents.length > 0 ? (
                  panelEvents.map((event) => (
                    <button
                      key={`${event.id}-${event.date.toISOString()}`}
                      type="button"
                      onClick={() =>
                        navigate("/friends", { state: { highlightUserId: event.id } })
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-gray-700 bg-gray-900/70 p-4 text-left transition hover:border-purple-500/40 hover:bg-gray-900"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
                          <FiGift size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{event.name}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {format(event.date, "MMM d")}
                          </p>
                        </div>
                      </div>

                      <span className="ml-3 shrink-0 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                        {event.daysLeft}d
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 p-4">
                    <p className="text-sm text-gray-400">
                      {selectedDate
                        ? "No birthdays are scheduled for the selected day."
                        : "No upcoming birthdays to show right now."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>

      <Modal
        isOpen={!isDesktopSidebar && (selectedDate !== null || isMobileUpcomingOpen)}
        onClose={closeMobileModal}
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {mobileModalTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {mobileModalDescription}
            </p>
          </div>

          {isLoadingEvents ? (
            <Spinner />
          ) : mobileModalEvents.length > 0 ? (
            <div className="space-y-3">
              {mobileModalEvents.map((event) => (
                <button
                  key={`${event.id}-${event.date.toISOString()}-mobile`}
                  type="button"
                  onClick={() => {
                    closeMobileModal();
                    navigate("/friends", { state: { highlightUserId: event.id } });
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-700 bg-gray-900/70 p-4 text-left transition hover:border-purple-500/40 hover:bg-gray-900"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
                      <FiGift size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">{event.name}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {format(event.date, "MMM d")}
                      </p>
                    </div>
                  </div>

                  <span className="ml-3 shrink-0 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                    {event.daysLeft}d
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 p-4">
              <p className="text-sm text-gray-400">
                {selectedDate
                  ? "No birthdays are scheduled for the selected day."
                  : "No upcoming birthdays to show right now."}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
