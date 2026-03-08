import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const getRegistrationErrorMessage = (error: unknown): string => {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";

  if (code === "auth/email-already-in-use" || message.includes("auth/email-already-in-use")) {
    return "This email is already registered.";
  }

  if (code === "auth/weak-password" || message.includes("WEAK_PASSWORD")) {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (code === "auth/invalid-email" || message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }

  return "Failed to register. Please try again.";
};

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const emailSignupPanelId = "email-signup-panel";
  const [signupMethod, setSignupMethod] = useState<"email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      checkboxRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
    } catch (error) {
      setError(getRegistrationErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 pt-8">
      <div className="mb-8 text-center">
        <img
          src="/gifty-logo.png"
          alt="Gifty"
          className="mx-auto h-[65px] w-auto"
        />
      </div>

      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <p className="text-sm text-gray-300 text-center">
          Choose how you want to create your account.
        </p>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full px-4 py-3 rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || googleLoading}
          >
            <FcGoogle className="text-xl" />
            {googleLoading ? "Connecting to Google..." : "Register with Google"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setSignupMethod("email");
            }}
            className="w-full px-4 py-3 rounded bg-purple-600 hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || googleLoading}
            aria-expanded={signupMethod === "email"}
            aria-controls={emailSignupPanelId}
          >
            Register with Email
          </button>
        </div>

        <div
          id={emailSignupPanelId}
          className={`overflow-hidden transition-all duration-300 ease-out ${
            signupMethod === "email" ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={signupMethod !== "email"}
        >
          {signupMethod === "email" && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
                required
                autoFocus
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    const nextPassword = e.target.value;
                    setPassword(nextPassword);

                    if (confirmPassword) {
                      setPasswordMatchError(confirmPassword !== nextPassword);
                    } else {
                      setPasswordMatchError(false);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordMatchError && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

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
                  &nbsp;I agree to Gifty&apos;s{" "}
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

              <button
                type="submit"
                className={`w-full px-4 py-2 rounded transition ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
                disabled={loading || googleLoading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
