import { useAuth } from "../components/AuthProvider";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const VerifyEmail = () => {
    const { firebaseUser } = useAuth();
    const [resent, setResent] = useState(false);
    const navigate = useNavigate();
    const { refreshFirebaseUser } = useAuth();

    const resendVerification = async () => {
        if (firebaseUser && !firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
        setResent(true);
        toast.success("Verification email sent again!");
        }
    };  

  const checkVerification = async () => {
    await refreshFirebaseUser();
    const refreshedUser = firebaseUser; // After reload, it reflects latest data
  
    if (refreshedUser?.emailVerified) {
      toast.success("Email verified! 🎉");
      navigate("/dashboard");
    } else {
      toast.error("Still not verified. Check your inbox.");
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="mb-2">
          We've sent a verification email to <strong>{firebaseUser?.email}</strong>.
        </p>
        <p>Please verify to continue.</p>

        <button
          onClick={resendVerification}
          className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Resend Verification Email
        </button>

        <button
          onClick={checkVerification}
          className="mt-4 ml-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          I Verified My Email
        </button>

        {resent && <p className="text-green-400 mt-2">Verification email sent again!</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
