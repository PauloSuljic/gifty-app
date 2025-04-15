import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
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
    } catch (err) {
      setError("Failed to send reset email. Make sure the email is correct.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
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
            className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
            required
          />
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
            Login
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          className="w-full px-4 py-2 bg-white text-black rounded flex items-center justify-center gap-2 shadow hover:bg-gray-100 transition"
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
