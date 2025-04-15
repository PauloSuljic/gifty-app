import { Link } from "react-router-dom";
import { FiGift, FiLogOut, FiHome, FiUser, FiX, FiSettings } from "react-icons/fi";
import { useAuth } from "../components/AuthProvider";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout } = useAuth();

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

        <nav className="mt-10 space-y-4">
          <Link to="/dashboard" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiHome size={20} /> <span>My Wishlists</span>
          </Link>
          <Link to="/shared-with-me" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiGift size={20} /> <span>Shared With Me</span>
          </Link>
          <Link to="/profile" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiUser size={20} /> <span>Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiSettings size={20} /> <span>Settings</span>
          </Link>
        </nav>

        <button onClick={logout} className="mt-auto flex items-center space-x-2 p-3 hover:bg-red-600 rounded-md">
          <FiLogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
