import { useRef, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiCalendar } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const checkboxRef = useRef<HTMLInputElement>(null);

  // Date limits
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      checkboxRef.current?.focus();
      return;
    }

    if (!dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    const dob = new Date(dateOfBirth);
    if (dob > new Date(maxDate)) {
      setError("You're too young for Gifty! 🎂 Come back in a few years.");
      return;
    }
    if (dob < new Date(minDate)) {
      setError("Wow, 100+ years old? We’re impressed, but please enter a valid date. 🧓");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, username, dateOfBirth);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 pt-8"> 
      {/* added pt-8 for top spacing */}
      <div className="mb-8 text-center">
        <img
          src="/gifty-logo.png"
          alt="Gifty"
          className="mx-auto h-[65px] w-auto"
        />
      </div>

      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Smaller consistent input sizes */}
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
            required
            autoFocus
          />

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordMatchError(false);
              }}
              onBlur={() => {
                if (confirmPassword && confirmPassword !== password) {
                  setPasswordMatchError(true);
                } else {
                  setPasswordMatchError(false);
                }
              }}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {passwordMatchError && (
              <p className="text-red-400 text-xs mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Date of Birth with white calendar icon */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-white pointer-events-none" />
            <input
              id="dateOfBirth"
              type="date"
              placeholder="Select your birthday"
              value={dateOfBirth}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 appearance-none"
              required
            />
          </div>

          {/* Terms */}
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
                rel="noopener noreferrer"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-blue-400 underline hover:text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Register Button */}
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Register with Google */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2 transition"
          >
            <FcGoogle className="text-xl" /> Register with Google
          </button>

          <p className="text-center text-sm">
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