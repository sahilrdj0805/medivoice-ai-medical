import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [newCredits, setNewCredits] = useState(null);
  
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      toast.error("No session ID found in redirect");
      navigate("/dashboard");
      return;
    }

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const res = await api.get(`/payments/verify-session/${sessionId}`);
      setNewCredits(res.data.credits);
      toast.success("Payment verified successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verification failed");
      navigate("/pricing");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="text-blue-600 animate-spin mb-4" size={40} />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Verifying your payment...</h2>
        <p className="text-sm text-gray-500 font-medium">Please do not refresh or close this tab.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-200/80 rounded-3xl p-10 max-w-md w-full shadow-xl shadow-gray-200/50"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 border-2 border-green-200"
          >
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight mb-2">Payment Successful!</h1>
        <p className="text-gray-500 font-medium text-sm mb-8">
          Thank you for your purchase. Your consultation credits have been added.
        </p>

        {newCredits !== null && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Your New Balance</p>
            <p className="text-4xl font-black text-blue-700">{newCredits} Credits</p>
          </div>
        )}

        <button 
          onClick={() => navigate("/dashboard")}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
