import { useState } from "react";
import Sidebar from "../Sidebar";
import GuestSidebar from "../ui/GuestSidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotificationContext } from "../../context/useNotificationContext";
import NotificationsModal from "../ui/modals/NotificationsModal";
import RightSidebar from "../RightSidebar";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  guest?: boolean; // Guest = no notifications, no sidebar items for logged users
}

interface LayoutInnerProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserLayoutInnerProps extends LayoutInnerProps {
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GuestLayoutInner = ({
  children,
  hideHeader,
  isSidebarOpen,
  setIsSidebarOpen,
}: LayoutInnerProps) => (
  <div className="flex h-screen relative overflow-x-hidden">
    <GuestSidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    />

    <div className="flex flex-1 flex-col lg:flex-row">
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
          <img src="/gifty-logo.png" alt="Gifty" className="h-[65px] w-auto" />
        </Link>
      </div>

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
    </div>
  </div>
);

const UserLayoutInner = ({
  children,
  hideHeader,
  isSidebarOpen,
  setIsSidebarOpen,
  isNotificationsOpen,
  setIsNotificationsOpen,
}: UserLayoutInnerProps) => {
  const { firebaseUser } = useAuth();
  const { unreadCount, markAllAsRead, loadNotifications } = useNotificationContext();

  const toggleNotifications = async () => {
    if (!isNotificationsOpen) {
      await loadNotifications();
    }
    setIsNotificationsOpen(prev => !prev);
  };

  return (
    <div
      className="flex h-screen relative overflow-x-hidden"
      onClick={() => setIsNotificationsOpen(false)}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div
        className="flex flex-1 flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
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
            <img src="/gifty-logo.png" alt="Gifty" className="h-[65px] w-auto" />
          </Link>

          {firebaseUser && (
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

        {firebaseUser && (
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => {
              setIsNotificationsOpen(false);
              markAllAsRead();
            }}
          />
        )}

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

        {firebaseUser && <RightSidebar />}
      </div>
    </div>
  );
};

const Layout = ({ children, hideHeader, guest }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (guest) {
    return (
      <GuestLayoutInner
        children={children}
        hideHeader={hideHeader}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    );
  }

  return (
    <UserLayoutInner
      children={children}
      hideHeader={hideHeader}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isNotificationsOpen={isNotificationsOpen}
      setIsNotificationsOpen={setIsNotificationsOpen}
    />
  );
};

export default Layout;
