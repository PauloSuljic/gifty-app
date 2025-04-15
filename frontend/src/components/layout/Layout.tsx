import { useState } from "react";
import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative overflow-x-hidden">
      {/* ✅ Sidebar (Always in DOM) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ✅ Main Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ✅ Mobile Top Row: Hamburger + Logo */}
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

          {/* Spacer to center logo */}
          <div className="w-10" />
        </div>

        {/* ✅ Main Content */}
        <div className="flex-1 flex flex-col lg:pr-6 p-4 pt-4 lg:pt-6">
          <DashboardHeader />
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
