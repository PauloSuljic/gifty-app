import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedWishlist from "./pages/SharedWishlist";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SharedWithMe from "./pages/SharedWithMe";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import VerifyEmail from "./pages/VerifyEmail";
import SettingsPage from "./pages/Settings";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000, // Custom duration (default is 5000ms)
          style: {
            background: "#333", // Dark mode background
            color: "#fff", // White text
            border: "1px solid #555", // Optional: subtle border
          },
          success: {
            iconTheme: {
              primary: "#22c55e", // Green success icon
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // Red error icon
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Private Routes (Require Authentication) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/shared/:shareCode" element={<SharedWishlist />} />
        <Route path="/shared-with-me" element={<PrivateRoute><SharedWithMe /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
