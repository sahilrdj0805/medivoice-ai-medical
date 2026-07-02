import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Activity, Heart, Save, Loader2, ClipboardList, Mail, Coins, ShieldAlert, Edit3, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prefill data when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAge(user.age || "");
      setGender(user.gender || "Male");
      setHeight(user.height || "");
      setWeight(user.weight || "");
      setMedicalHistory(user.medicalHistory || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age || !height || !weight || !gender) {
      return toast.error("Please fill in all basic fields");
    }

    setSaving(true);
    try {
      await updateProfile({
        name,
        age,
        gender,
        height,
        weight,
        medicalHistory
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setAge(user.age || "");
      setGender(user.gender || "Male");
      setHeight(user.height || "");
      setWeight(user.weight || "");
      setMedicalHistory(user.medicalHistory || "");
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-[88vh] bg-gradient-to-tr from-gray-50 via-slate-50 to-blue-50/20 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-950 tracking-tight mb-2 bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Manage your personal metrics and medical background to maintain diagnostic accuracy.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/30 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            
            {/* Avatar Circle */}
            <div className="relative mb-6 mt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-blue-500/20 outline outline-4 outline-white">
                {name?.charAt(0).toUpperCase() || "P"}
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
            </div>

            <h2 className="text-xl font-bold text-gray-950 mb-1">{name || "Patient Profile"}</h2>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Session Active
            </div>

            <div className="w-full space-y-3.5 mb-6 text-left border-t border-b border-gray-100 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium flex items-center gap-2">
                  <Mail size={16} /> Email
                </span>
                <span className="text-gray-900 font-bold max-w-[160px] truncate">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium flex items-center gap-2">
                  <Coins size={16} /> Credits
                </span>
                <span className="text-blue-600 font-black">{user?.credits ?? 0} left</span>
              </div>
            </div>

            <div className="w-full bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex gap-3 text-left">
              <ShieldAlert className="text-blue-600 shrink-0" size={20} />
              <p className="text-blue-900/80 text-xs font-medium leading-relaxed">
                Your medical history remains completely private and encrypted. Only you and the diagnostic AI have access.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Edit Profile Form / Read-Only View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/30"
          >
            {/* Mode Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-xl">
                {isEditing ? "Modify Details" : "Medical Profile Details"}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                >
                  <Edit3 size={15} /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              /* --- EDITING MODE FORM --- */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-blue-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                    placeholder="Your Name"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Heart size={16} className="text-rose-500" /> Age (Years)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={16} className="text-indigo-500" /> Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Activity size={16} className="text-emerald-500" /> Height (cm)
                    </label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                      placeholder="Height"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Activity size={16} className="text-orange-500" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="300"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                      placeholder="Weight"
                    />
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <ClipboardList size={16} className="text-amber-500" /> Medical History & Allergies (Optional)
                  </label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows="4"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm resize-none leading-relaxed"
                    placeholder="Mention chronic conditions, surgeries, regular medications, or allergies..."
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10 flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* --- READ-ONLY VIEW MODE --- */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  
                  {/* Name Row */}
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Full Name</span>
                    <span className="text-gray-800 font-bold text-base md:text-lg">{name || "Not set"}</span>
                  </div>

                  {/* Gender Row */}
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Gender</span>
                    <span className="text-gray-800 font-bold text-base md:text-lg">{gender || "Not set"}</span>
                  </div>

                  {/* Age Row */}
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Age</span>
                    <span className="text-gray-800 font-bold text-base md:text-lg">{age ? `${age} years` : "Not set"}</span>
                  </div>

                  {/* Height Row */}
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Height</span>
                    <span className="text-gray-800 font-bold text-base md:text-lg">{height ? `${height} cm` : "Not set"}</span>
                  </div>

                  {/* Weight Row */}
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Weight</span>
                    <span className="text-gray-800 font-bold text-base md:text-lg">{weight ? `${weight} kg` : "Not set"}</span>
                  </div>

                </div>

                {/* Medical History Section */}
                <div className="pt-4 border-t border-gray-50">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">Medical History & Allergies</span>
                  <div className="bg-gray-50/50 border border-gray-200/50 rounded-2xl p-5 text-gray-700 text-sm leading-relaxed font-medium min-h-[100px] whitespace-pre-wrap">
                    {medicalHistory || "No medical history, chronic conditions, or allergies declared."}
                  </div>
                </div>

              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
