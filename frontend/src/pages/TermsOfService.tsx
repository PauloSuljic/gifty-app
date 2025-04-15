import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-8 pb-16">
      {/* 🔝 Logo Section */}
      <div className="flex justify-center items-center w-full mb-8">
        <Link
          to="/dashboard"
          className="p-3 flex items-center justify-center text-center"
        >
          <img
            src="/gifty-logo.png"
            alt="Gifty"
            className="h-[65px] w-auto"
          />
        </Link>
      </div>

      {/* 📄 Main Content */}
      <div className="max-w-3xl w-full mx-auto bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6">Terms of Service</h1>

        <p className="mb-4 text-gray-300 text-center">
          Welcome to Gifty! By using our service, you agree to the following terms:
        </p>

        <ol className="list-decimal ml-6 text-gray-400 space-y-3">
          <li>
            <strong>Account Responsibility:</strong> You are responsible for your login credentials and any activity under your account.
          </li>
          <li>
            <strong>Appropriate Use:</strong> Do not use Gifty to post offensive, harmful, or illegal content.
          </li>
          <li>
            <strong>Data & Availability:</strong> While we aim to keep Gifty reliable, we cannot guarantee uptime or data integrity.
          </li>
          <li>
            <strong>Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.
          </li>
        </ol>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Last updated: April 8, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
