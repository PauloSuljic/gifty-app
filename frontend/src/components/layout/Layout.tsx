import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import GuestSidebar from "../ui/GuestSidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu, FiBell, FiGift, FiX, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

// If you use a custom useAuth hook for Firebase authentication, import it:
import { useAuth } from "../AuthProvider"; // Adjust path as needed
import { apiFetch } from "../../api";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  guest?: boolean;
}


const Layout = ({ children, hideHeader, guest }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

  const { firebaseUser } = useAuth();

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // Fetch notifications on mount
  useEffect(() => {
    let ignore = false;
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = "";
        if (firebaseUser && firebaseUser.getIdToken) {
          token = await firebaseUser.getIdToken();
        }
        const res = await apiFetch(
          "/api/notifications",
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        console.log("Fetched notifications:", data); // Debug
        if (!ignore) setNotifications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!ignore) setError(err.message || "Error loading notifications");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (!guest && firebaseUser) {
      fetchNotifications();
    }
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [guest, firebaseUser]);

  // ✅ Mark all notifications as read after modal closes
  useEffect(() => {
    const markAllRead = async () => {
      if (isNotificationsOpen) return; // don't mark while it's open
      if (notifications.length === 0 || notifications.every((n) => n.isRead)) return;

      setMarkingRead(true);
      try {
        let token = "";
        if (firebaseUser && firebaseUser.getIdToken) {
          token = await firebaseUser.getIdToken();
        }
        const res = await apiFetch("/api/notifications/mark-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error("Failed to mark notifications as read");

        // Update local state to reflect read status
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      } finally {
        setMarkingRead(false);
      }
    };

    // 🔁 Run when modal closes (i.e., was open and now closed)
    if (!isNotificationsOpen) {
      markAllRead();
    }
    // eslint-disable-next-line
  }, [isNotificationsOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-screen relative overflow-x-hidden" onClick={closeNotifications}>
      {/* ✅ Sidebar (Always in DOM) */}
      {guest ? (
        <GuestSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {/* ✅ Main Area */}
      <div className="flex flex-1 flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
        {/* ✅ Mobile Top Row: Hamburger + Logo + Bell */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 bg-gray-800 rounded-lg shadow-lg"
          >
            <FiMenu size={24} />
          </button>

          <Link
            to="/dashboard"
            className="p-3 m-3 flex items-center justify-center text-center"
          >
            <img
              src="/gifty-logo.png"
              alt="Gifty"
              className="h-[65px] w-auto"
            />
          </Link>

          <button
            onClick={toggleNotifications}
            className="p-2 bg-gray-800 rounded-lg shadow-lg text-white relative"
          >
            <FiBell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-xs text-white rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {isNotificationsOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeNotifications}
            />
            <div className="fixed right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-[90%] sm:w-96 mx-auto max-h-[80vh] overflow-y-auto z-50 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FiBell className="text-purple-500" size={20} />
                  <h2 className="text-large font-semibold text-gray-100">Notifications</h2>
                </div>
                <button
                  onClick={closeNotifications}
                  className="text-gray-400 hover:text-gray-200"
                  aria-label="Close notifications"
                >
                  <FiX size={24} />
                </button>
              </div>
              {loading ? (
                <div className="text-gray-400 text-center py-6">Loading notifications...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-6">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="text-gray-400 text-center py-6">No notifications</div>
              ) : (
                <ul className="flex flex-col space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start justify-between p-4 rounded-lg transition-colors ${
                        n.isRead ? "bg-gray-800" : "bg-gray-700"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {n.type === "BirthdayReminder" && <FiGift className="text-purple-400 flex-shrink-0" size={18} />}
                        {n.type === "ItemReserved" && <FiGift className="text-purple-400 flex-shrink-0" size={18} />}
                        {n.type === "WishlistShared" && <FiUser className="text-purple-400 flex-shrink-0" size={18} />}
                        {n.type === "EventTomorrow" && <FiBell className="text-purple-400 flex-shrink-0" size={18} />}
                        <div>
                          <p className="text-purple-300 text-xs">{n.title}</p>
                          <p className="text-gray-400 text-xs">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {!n.isRead && <span className="h-2 w-2 bg-purple-500 rounded-full mt-2 ml-3"></span>}
                    </li>
                  ))}
                </ul>
              )}
              <button
                disabled={markingRead}
                onClick={() => setIsNotificationsOpen(false)}
                className={`w-full rounded border border-gray-600 hover:bg-gray-700/50 text-purple-400 text-sm font-medium text-center py-2 mt-4 ${
                  markingRead ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {markingRead ? (
                  <span className="flex justify-center items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-purple-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Marking...
                  </span>
                ) : (
                  "View All Notifications"
                )}
              </button>
            </div>
          </>
        )}

        {/* ✅ Main Content */}
        <div className="flex-1 flex flex-col lg:pr-6 p-4 pt-4 lg:pt-6">
          {!hideHeader && <DashboardHeader />}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>

        {/* ✅ Right Sidebar for Widgets */}
        <aside className="w-64 hidden lg:flex flex-col justify-center items-center bg-gray-900 p-4 rounded-lg shadow-lg ml-6">
          <p className="text-gray-400 text-center">🎁 Coming Soon: <br /> Friendships & Calendar</p>
        </aside>
      </div>
    </div>
  );
};

export default Layout;
