import { Link } from "react-router-dom";
import { FiGift, FiHome, FiUserPlus, FiLogIn, FiX, FiInfo } from "react-icons/fi";

type GuestSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GuestSidebar = ({ isOpen, onClose }: GuestSidebarProps) => {
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
          to="/"
          className="p-3 m-3 flex items-center justify-center text-center"
        >
          <img
            src="/gifty-logo.png"
            alt="Gifty"
            className="h-[65px] w-auto"
          />
        </Link>

        <nav className="mt-10 space-y-4">
          <Link to="/login" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiLogIn size={20} /> <span>Login</span>
          </Link>
          <Link to="/register" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiUserPlus size={20} /> <span>Sign Up</span>
          </Link>
          <Link to="/login" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
            <FiInfo size={20} /> <span>About</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default GuestSidebar;