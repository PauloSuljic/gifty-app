import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-xl mt-4">Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
