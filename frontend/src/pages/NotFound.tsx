import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="pt-20 flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-5xl md:text-6xl font-bold text-purple-500">404</h1>
      <p className="text-lg md:text-xl mt-4 text-center">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-6 py-3 bg-purple-700 hover:bg-blue-500 text-white rounded-md shadow-md transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
