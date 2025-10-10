import { useState } from "react";
import Sidebar from "../Sidebar";
import GuestSidebar from "../ui/GuestSidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu, FiBell, FiGift, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  guest?: boolean;
}

const notifications = [
  {
    id: 1,
    type: "gift",
    title: "Sarah’s birthday in 3 days",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    type: "gift",
    title: "Benjamin reserved an item",
    time: "1 day ago",
    unread: true,
  },
  {
    id: 3,
    type: "gift",
    title: "John reserved an item from your wishlist",
    time: "3 days ago",
    unread: false,
  },
];

const Layout = ({ children, hideHeader, guest }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

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
            <span className="absolute -top-1 -right-1 bg-purple-500 text-xs text-white rounded-full px-1">2</span>
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
                  <FiBell className="text-purple-500" size={24} />
                  <h2 className="text-xl font-semibold text-gray-100">Notifications</h2>
                </div>
                <button
                  onClick={closeNotifications}
                  className="text-gray-400 hover:text-gray-200"
                  aria-label="Close notifications"
                >
                  <FiX size={24} />
                </button>
              </div>
              <ul className="flex flex-col space-y-3">
                {notifications.map(({ id, type, title, time, unread }) => (
                  <li
                    key={id}
                    className={`relative flex space-x-3 p-3 rounded-md cursor-pointer text-gray-300 ${
                      unread ? "bg-gray-800" : "bg-transparent"
                    } hover:bg-gray-700/50`}
                  >
                    <div className="flex-shrink-0 text-purple-500 mt-1">
                      <FiGift size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{title}</span>
                      <span className="text-xs text-gray-500">{time}</span>
                    </div>
                    {unread && (
                      <span className="absolute right-2 top-2 w-2 h-2 bg-purple-500 rounded-full" />
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full rounded border border-gray-600 hover:bg-gray-700/50 text-purple-400 text-sm font-medium text-center py-2 mt-4"
              >
                View All Notifications
              </button>
            </div>
          </>
        )}

        {/* ✅ Main Content */}
        <div className="flex-1 flex flex-col lg:pr-6 p-4 pt-4 lg:pt-6">
          {!hideHeader && <DashboardHeader />}
          <div className="flex-1 overflow-y-auto p-4">
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
