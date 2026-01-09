import { useState } from "react";
import Sidebar from "../Sidebar";
import GuestSidebar from "../ui/GuestSidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotificationContext } from "../../context/NotificationContext";
import NotificationsModal from "../ui/modals/NotificationsModal";
import RightSidebar from "../RightSidebar";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  guest?: boolean; // Guest = no notifications, no sidebar items for logged users
}

const Layout = ({ children, hideHeader, guest }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { firebaseUser } = useAuth();

  // SAFE: only call context if NOT guest
  const notificationContext = !guest ? useNotificationContext() : null;

  const unreadCount = notificationContext?.unreadCount ?? 0;
  const markAllAsRead = notificationContext?.markAllAsRead ?? (() => {});
  const loadNotifications = notificationContext?.loadNotifications ?? (async () => {});

  const toggleNotifications = async () => {
    if (!isNotificationsOpen && !guest) {
      await loadNotifications();
    }
    setIsNotificationsOpen(prev => !prev);
  };

  return (
    <div
      className="flex h-screen relative overflow-x-hidden"
      onClick={() => setIsNotificationsOpen(false)}
    >
      {/* Sidebar */}
      {guest ? (
        <GuestSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className="flex flex-1 flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile header row */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4">
          {/* Menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 bg-gray-800 rounded-lg shadow-lg"
          >
            <FiMenu size={24} />
          </button>

          {/* Logo */}
          <Link
            to="/dashboard"
            className="p-3 m-3 flex items-center justify-center text-center"
          >
            <img src="/gifty-logo.png" alt="Gifty" className="h-[65px] w-auto" />
          </Link>

          {/* Notification Bell – ONLY for logged in, not guests */}
          {!guest && firebaseUser && (
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
          )}
        </div>

        {/* Notifications Modal */}
        {!guest && firebaseUser && (
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => {
              setIsNotificationsOpen(false);
              markAllAsRead();
            }}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 pt-4 lg:pt-6">
          {!hideHeader && (
            <Link
              to="/profile"
              className="cursor-pointer"
              aria-label="Go to profile"
            >
              <DashboardHeader />
            </Link>
          )}

          <div className="flex-1 overflow-y-auto p-2">{children}</div>
        </div>

        {/* Right Sidebar – "Coming Soon" */}
        {!guest && firebaseUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default Layout;
