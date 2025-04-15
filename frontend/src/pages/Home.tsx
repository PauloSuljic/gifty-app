import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-900 text-white px-4 py-8">
      <div className="flex-grow flex flex-col items-center justify-center text-center max-w-2xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
          Welcome to Gifty
        </h1>
        <p className="text-lg text-gray-300 mt-4">
          A next-gen platform for finding and sharing the best gifts.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <button className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-all text-white shadow-lg w-full sm:w-auto">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-all text-white shadow-lg w-full sm:w-auto">
              Register
            </button>
          </Link>
        </div>
      </div>
      <footer className="mt-8 text-sm text-gray-500 text-center">
        Developed by Paulo Suljic
      </footer>
    </div>
  );
};

export default Home;
