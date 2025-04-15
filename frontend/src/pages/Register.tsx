import { useRef, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Link } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      checkboxRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      await register(email, password, username);
    } catch (err: any) {
      if (err.message.includes("auth/email-already-in-use")) {
        setError("This email is already registered.");
      } else {
        setError("Failed to register. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="mb-8 text-center">
      <img
        src="/gifty-logo.png"
        alt="Gifty"
        className="mx-auto h-[65px] w-auto"
      />
    </div>

      {/* 📝 Register Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>

          {/* Terms & Conditions */}
          <label className="flex items-start gap-2 text-sm text-gray-300">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-5 w-5 accent-purple-600 rounded"
              required
            />
            <span className="pt-1">
              &nbsp;I agree to Gifty's{" "}
              <Link 
                to="/terms" 
                className="text-blue-400 underline hover:text-blue-300" 
                target="_blank" 
                rel="noopener noreferrer">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" 
                className="text-blue-400 underline hover:text-blue-300" 
                target="_blank" 
                rel="noopener noreferrer">
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            className={`w-full px-4 py-2 rounded transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-center p-1">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
