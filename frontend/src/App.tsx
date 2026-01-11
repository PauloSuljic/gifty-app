import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedWishlist from "./pages/SharedWishlist";
import PrivateRoute from "./app/routes/PrivateRoute";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SharedWithMe from "./pages/SharedWithMe";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import VerifyEmail from "./pages/VerifyEmail";
import SettingsPage from "./pages/Settings";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import WishlistDetail from "./pages/WishlistDetails";
import CalendarPage from "./pages/Calendar/CalendarPage";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import LayoutWrapper from "./components/layout/LayoutWrapper";
import Layout from "./components/layout/Layout";

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
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
            path="/shared/:shareCode"
            element={
              <Layout hideHeader guest>
                <SharedWishlist />
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />

        {/* --- PRIVATE ROUTES (wrapped in layout) --- */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <NotificationProvider>
                <LayoutWrapper />
              </NotificationProvider>
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shared-with-me" element={<SharedWithMe />} />
          <Route path="wishlist/:id" element={<WishlistDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
    
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
