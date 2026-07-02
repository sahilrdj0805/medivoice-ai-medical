import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Heart, ArrowRight, Loader2, Sparkles, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ProfileSetup() {
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!age || !height || !weight || !gender) {
      return toast.error("Please fill in all basic fields");
    }

    setLoading(true);
    try {
      await updateProfile({
        age,
        gender,
        height,
        weight,
        medicalHistory
      });
      await refreshUser(); // Update credit count in auth state
      setShowSuccessModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-16 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 mx-auto mb-4">
              <Heart className="text-blue-600 animate-pulse" size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-950 tracking-tight mb-2">Setup Medical Profile</h2>
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-sm mx-auto">
              Please enter your body details. This information will be provided directly to the AI doctor for personalized consultations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Age & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User size={16} className="text-gray-400" /> Age (Years)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400"
                  placeholder="e.g. 28"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Row 2: Height & Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Activity size={16} className="text-gray-400" /> Height (cm)
                </label>
                <input
                  type="number"
                  required
                  min="40"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400"
                  placeholder="e.g. 175"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Activity size={16} className="text-gray-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400"
                  placeholder="e.g. 70"
                />
              </div>
            </div>

            {/* Row 3: Medical History */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Past Medical History & Allergies (Optional)
              </label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                rows="4"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400 resize-none"
                placeholder="Mention any existing chronic conditions, medications, or drug allergies (e.g. Diabetes, Asthma, Allergy to Penicillin). Write 'None' if not applicable."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Save Details & Proceed <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Credits Celebration Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Sparkles effect */}
              <div className="absolute top-4 left-6 text-yellow-400">
                <Sparkles size={24} className="animate-bounce" />
              </div>
              <div className="absolute top-6 right-8 text-yellow-400">
                <Sparkles size={18} className="animate-pulse" />
              </div>

              {/* Gift Icon Container */}
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm relative">
                <Gift size={40} />
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>

              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-4 py-1.5 rounded-full inline-block mb-3">
                Welcome Gift Activated
              </span>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                Woohoo! You received 100 Free Credits!
              </h3>
              
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Your medical profile is now active! We have credited <strong className="text-blue-600 font-bold">100 free consultation credits</strong> to your account. Each consultation consumes 10 credits, giving you 10 complete consultations with our AI panel.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
