import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  const handlePasswordReset = async () => {
    setResetMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent!");
      setShowReset(false);
    } catch {
      setError("Failed to send reset email. Make sure the email is correct.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 pt-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img
          src="/gifty-logo.png"
          alt="Gifty"
          className="mx-auto h-[65px] w-auto"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {resetMessage && <p className="text-green-400 text-center">{resetMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 hover:border-purple-400 transition"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 hover:border-purple-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
            Login
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded flex items-center justify-center gap-2 shadow hover:bg-gray-600 transition"
        >
          <FcGoogle size={20} />
          Login with Google
        </button>

        <div className="text-center">
          <button
            onClick={() => setShowReset(!showReset)}
            className="text-sm text-blue-400 hover:underline mt-2"
          >
            Forgot Password?
          </button>
        </div>

        {showReset && (
          <div className="mt-4 space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
            />
            <button
              onClick={handlePasswordReset}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Send Reset Link
            </button>
          </div>
        )}

        <p className="text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
