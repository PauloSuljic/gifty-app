import { useLocation, useNavigate } from "react-router-dom";
import { FiGift, FiLogOut, FiHome, FiUser, FiX, FiSettings, FiCalendar } from "react-icons/fi";
import { useAuth } from "../components/AuthProvider";
import { useState, useEffect } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen: isOpenProp, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(isOpenProp);
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);

  const handleLinkClick = (path: string) => {
    setActivePath(path);
    setIsOpen(false);
    setTimeout(() => {
      navigate(path);
      onClose();
    }, 200);
  };

  return (
    <>
      {/* ✅ Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ✅ Sidebar Panel */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg p-5 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:relative lg:translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden self-end mb-4 text-white hover:text-red-500"
        >
          <FiX size={24} />
        </button>

        <button
          onClick={() => handleLinkClick("/dashboard")}
          className="p-3 m-3 flex items-center justify-center text-center"
        >
          <img
            src="/gifty-logo.png"
            alt="Gifty"
            className="h-[65px] w-auto"
          />
        </button>

        <nav className="mt-10 space-y-4">
          <button
            onClick={() => handleLinkClick("/dashboard")}
            className={`flex items-center space-x-2 p-3 rounded-md w-full hover:bg-gray-800 ${
              activePath === "/dashboard" ? "font-bold bg-gray-800" : ""
            }`}
          >
            <FiHome size={20} /> <span>My Wishlists</span>
          </button>
          <button
            onClick={() => handleLinkClick("/shared-with-me")}
            className={`flex items-center space-x-2 p-3 rounded-md w-full hover:bg-gray-800 ${
              activePath === "/shared-with-me" ? "font-bold bg-gray-800" : ""
            }`}
          >
            <FiGift size={20} /> <span>Shared With Me</span>
          </button>
          <button
            onClick={() => handleLinkClick("/profile")}
            className={`flex items-center space-x-2 p-3 rounded-md w-full hover:bg-gray-800 ${
              activePath === "/profile" ? "font-bold bg-gray-800" : ""
            }`}
          >
            <FiUser size={20} /> <span>Profile</span>
          </button>
          <button
            onClick={() => handleLinkClick("/calendar")}
            className={`flex items-center space-x-2 p-3 rounded-md w-full hover:bg-gray-800 ${
              activePath === "/calendar" ? "font-bold bg-gray-800" : ""
            }`}
          >
            <FiCalendar size={20} /> <span>Calendar</span>
          </button>
        </nav>
        <div className="mt-auto flex flex-col space-y-2">
          <button
            onClick={() => handleLinkClick("/settings")}
            className={`flex items-center space-x-2 p-3 rounded-md w-full hover:bg-gray-800 ${
              activePath === "/settings" ? "font-bold bg-gray-800" : ""
            }`}
          >
            <FiSettings size={20} /> <span>Settings</span>
          </button>
          <button onClick={logout} className="flex items-center space-x-2 p-3 rounded-md w-full hover:bg-red-600 hover:text-white text-white">
            <FiLogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
