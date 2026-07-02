import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowRight, Stethoscope, Clock, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Triage State
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [triageStep, setTriageStep] = useState(1); // 1: input, 2: loading, 3: results, 4: mismatch warning
  const [triageSymptoms, setTriageSymptoms] = useState("");
  const [triageResults, setTriageResults] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/ai/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (doctorObj, symptoms) => {
    try {
      const res = await api.post("/sessions", { doctor: doctorObj, symptoms });
      await refreshUser(); // Update credit count instantly in context
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start session");
    }
  };

  const handleTriageSubmit = async () => {
    if (!triageSymptoms.trim()) {
        toast.error("Please enter your symptoms");
        return;
    }
    setTriageStep(2);
    try {
      const res = await api.post("/ai/suggest-doctors", { symptoms: triageSymptoms });
      setTriageResults(res.data);
      setTriageStep(3);
    } catch (err) {
      toast.error("Failed to analyze symptoms");
      setTriageStep(1);
    }
  };

  const handleDirectConsultSubmit = async () => {
    if (!triageSymptoms.trim()) {
        toast.error("Please enter your symptoms");
        return;
    }
    setTriageStep(2);
    try {
      const res = await api.post("/ai/suggest-doctors", { symptoms: triageSymptoms });
      setTriageResults(res.data);
      
      // Check if selectedDoctor matches any suggested specialist
      const isMatch = res.data.some(
        (d) => d.specialist.toLowerCase() === selectedDoctor.specialist.toLowerCase()
      );
      
      if (isMatch) {
        // Direct match, start session immediately
        await startSession(selectedDoctor, triageSymptoms);
      } else {
        // Mismatch! Proceed to warning stage (step 4)
        setTriageStep(4);
      }
    } catch (err) {
      toast.error("Failed to analyze symptoms");
      setTriageStep(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative">
      
      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-lg shadow-blue-600/20 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Need medical advice?</h1>
            <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
              Describe your symptoms and let our intelligent AI assistant connect you with the perfect specialist instantly.
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedDoctor(null);
              setTriageSymptoms("");
              setTriageStep(1);
              setTriageModalOpen(true);
            }}
            className="relative z-10 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 whitespace-nowrap flex items-center gap-2 shrink-0 border border-blue-100"
          >
            + Start AI Consultation
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
               <Stethoscope size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Available Specialists</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => {
                  setSelectedDoctor(doc);
                  setTriageSymptoms("");
                  setTriageStep(1);
                  setTriageModalOpen(true);
                }}
                className="group relative bg-white rounded-[2rem] p-3 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100"
              >
                  <div className="relative h-48 w-full rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4 shadow-inner">
                    {doc.image ? (
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-blue-50/50 flex flex-col items-center justify-center text-blue-500 gap-2">
                        <Stethoscope size={40} className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600/80">AI Specialist</span>
                      </div>
                    )}
                  </div>
                 <div className="px-3 pb-3">
                    <h3 className="font-bold text-lg text-gray-950 leading-tight mb-1">{doc.specialist}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">Click to consult with {doc.name || doc.specialist.toLowerCase()} directly.</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12 mb-8">
            <button 
                onClick={() => navigate('/history')}
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl flex items-center gap-3 border border-blue-100"
            >
                <Clock size={20} /> View Saved Reports
            </button>
        </div>
      </div>

      {/* AI Triage Modal */}
      <AnimatePresence>
          {triageModalOpen && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
              >
                  <motion.div 
                      initial={{ scale: 0.95, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 20 }}
                      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 overflow-hidden"
                  >
                      {triageStep === 1 && (
                          <div className="p-8">
                              <div className="flex justify-between items-center mb-6">
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedDoctor ? `Consult with ${selectedDoctor.specialist}` : "Describe Your Symptoms"}
                                  </h2>
                                  <button onClick={() => { setSelectedDoctor(null); setTriageModalOpen(false); }} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
                              </div>
                              <p className="text-gray-500 mb-4 text-sm font-medium">
                                {selectedDoctor 
                                  ? `Describe what symptoms you are experiencing so ${selectedDoctor.name} can analyze your condition.` 
                                  : "Please describe how you're feeling in detail. Our AI will analyze your symptoms and suggest the most appropriate specialist for your consultation."
                                }
                              </p>
                              <textarea 
                                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium text-gray-700"
                                  placeholder={selectedDoctor ? `Describe symptoms for ${selectedDoctor.specialist.toLowerCase()} concerns...` : "E.g., I've been having sharp pain in my lower back for the past 3 days..."}
                                  value={triageSymptoms}
                                  onChange={(e) => setTriageSymptoms(e.target.value)}
                              />
                              <div className="mt-6 flex justify-end">
                                  <button 
                                      onClick={selectedDoctor ? handleDirectConsultSubmit : handleTriageSubmit}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md"
                                  >
                                      {selectedDoctor ? "Start Consultation" : "Analyze Symptoms"} <ArrowRight size={18} />
                                  </button>
                              </div>
                          </div>
                      )}
                      
                      {triageStep === 2 && (
                          <div className="p-16 flex flex-col items-center justify-center text-center">
                              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                              <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Symptoms...</h2>
                              <p className="text-gray-500 text-sm max-w-xs">Our AI is reviewing your case and finding the best specialist for you.</p>
                          </div>
                      )}

                      {triageStep === 3 && (
                          <div className="p-8">
                              <div className="flex justify-between items-center mb-6">
                                  <h2 className="text-2xl font-bold text-gray-900">Suggested Specialists</h2>
                                  <button onClick={() => { setTriageModalOpen(false); setTriageStep(1); }} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
                              </div>
                              <p className="text-gray-500 mb-6 text-sm">Based on your symptoms, we recommend consulting with one of these specialists. Click a doctor to begin.</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {triageResults.map(doc => (
                                      <div key={doc.id} onClick={() => startSession(doc, triageSymptoms)} className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                                          <img src={doc.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} alt={doc.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                          <div>
                                              <h3 className="font-bold text-gray-900 leading-tight">{doc.specialist}</h3>
                                              <p className="text-sm text-gray-500 font-medium">{doc.name}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="mt-8 flex justify-between items-center">
                                  <button onClick={() => setTriageStep(1)} className="text-gray-500 font-medium hover:text-gray-900 text-sm">← Back to symptoms</button>
                              </div>
                          </div>
                      )}

                      {triageStep === 4 && (
                          <div className="p-8 flex flex-col items-center text-center">
                              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-500 mb-5">
                                  <ShieldAlert size={32} />
                              </div>
                              <h2 className="text-xl font-bold text-gray-950 mb-2">Specialist Mismatch Warning</h2>
                              <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-6">
                                  You selected <strong className="text-gray-900">{selectedDoctor?.specialist} ({selectedDoctor?.name})</strong>. 
                                  However, based on your symptoms, our AI suggests consulting with a 
                                  <strong className="text-blue-600"> {triageResults[0]?.specialist || "different specialist"}</strong> instead.
                              </p>
                              
                              <div className="flex flex-col sm:flex-row w-full gap-3 justify-center mb-4">
                                  <button
                                      onClick={() => startSession(triageResults[0] || selectedDoctor, triageSymptoms)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer flex-1"
                                  >
                                      Consult {triageResults[0]?.specialist || "Recommended"}
                                  </button>
                                  <button
                                      onClick={() => startSession(selectedDoctor, triageSymptoms)}
                                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-xl text-sm transition-all cursor-pointer flex-1"
                                  >
                                      Consult {selectedDoctor?.specialist} Anyway
                                  </button>
                              </div>
                              <button 
                                  onClick={() => setTriageStep(1)} 
                                  className="text-gray-400 hover:text-gray-600 text-xs font-semibold hover:underline mt-2 cursor-pointer"
                              >
                                  ← Edit Symptoms
                              </button>
                          </div>
                      )}
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
