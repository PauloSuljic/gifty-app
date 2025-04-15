import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-8 pb-16">
      {/* 🔝 Logo Section */}
      <div className="flex justify-center items-center w-full mb-8">
        <Link to="/dashboard" className="p-3 flex items-center justify-center text-center">
          <img src="/gifty-logo.png" alt="Gifty" className="h-[65px] w-auto" />
        </Link>
      </div>

      {/* 📄 Main Content */}
      <div className="max-w-3xl w-full mx-auto bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6">Privacy Policy</h1>

        <p className="mb-4 text-gray-300 text-center">
          Your privacy is important to us. Here’s how we handle your data:
        </p>

        <ul className="list-disc ml-6 text-gray-400 space-y-3">
          <li>
            <strong>Account Info:</strong> We collect your username, email, and optional bio to personalize your experience.
          </li>
          <li>
            <strong>Usage Tracking:</strong> We may collect anonymous analytics data to improve performance and user experience.
          </li>
          <li>
            <strong>Third-party Services:</strong> We use Firebase for authentication. Your data is stored securely.
          </li>
          <li>
            <strong>Data Deletion:</strong> You can delete your account at any time from Settings. This will remove all your data.
          </li>
        </ul>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Last updated: April 8, 2025
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
