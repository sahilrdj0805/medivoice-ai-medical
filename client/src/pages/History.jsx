import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";
import { Loader2, Clock, Activity, Trash2, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/sessions");
      const endedSessions = res.data.filter(s => s.status === "ended");
      setSessions(endedSessions);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this consultation report?")) return;
    
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      toast.success("Consultation report deleted");
      
      // Handle edge case where deleting the last item on a page leaves it empty
      const totalPages = Math.ceil((sessions.length - 1) / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
      }
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const currentSessions = sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative pt-12">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                 <Clock size={20} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Consultation Reports</h1>
            </div>
            <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-bold border border-gray-200 transition-colors shadow-sm text-sm"
            >
                Back to Dashboard
            </button>
        </div>

        {sessions.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-[2rem] bg-white/50 backdrop-blur-sm p-16 flex flex-col items-center justify-center text-center mb-16 max-w-4xl mx-auto">
            <div className="mb-6 opacity-80 mix-blend-multiply">
                <img src="/empty-state.svg" alt="No Consultations" className="w-48 h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Recent Consultations</h3>
            <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">Your medical history is clear. Start a new session to log your first AI consultation.</p>
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Activity size={16} /> Start a Consultation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-5 px-8 font-semibold">Specialist</th>
                    <th className="py-5 px-6 font-semibold">Symptoms</th>
                    <th className="py-5 px-6 font-semibold">Date</th>
                    <th className="py-5 px-8 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {currentSessions.map(s => (
                    <tr key={s._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          {s.doctor?.image ? (
                            <img
                              src={s.doctor.image}
                              alt={s.doctor?.name}
                              className="w-10 h-10 rounded-xl bg-gray-50 object-cover border border-gray-200/60 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                              <Stethoscope size={16} />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{s.doctor?.specialist || "General Physician"}</span>
                            <span className="text-xs text-gray-400 font-semibold">{s.doctor?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-gray-500 truncate max-w-[200px] font-medium">{s.symptoms}</td>
                      <td className="py-6 px-6 text-gray-500 font-medium">
                         <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs">{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
                      </td>
                      <td className="py-6 px-8 text-right flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setSelectedReport({ ...s.report, sessionData: s })} 
                          className="text-gray-700 font-bold hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          View Report
                        </button>
                        <button 
                            onClick={() => handleDelete(s._id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Consultation"
                        >
                            <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, sessions.length)}</span> of <span className="font-bold text-gray-900">{sessions.length}</span> consultations
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors bg-white shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 bg-transparent'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors bg-white shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-gray-200 p-6 md:p-8 relative">
            
            {/* Close Button Top Right */}
            <button 
              onClick={() => setSelectedReport(null)} 
              className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <span className="text-xl font-bold leading-none block">&times;</span>
            </button>

            {/* Document Header */}
            <div className="text-center pb-4 border-b border-gray-150 mb-6">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-150">
                Diagnostic Consultation Summary
              </span>
              <h3 className="text-xl font-black text-gray-950 mt-3">Official Session Report</h3>
              <p className="text-gray-400 text-xs mt-1">
                Consulted on {format(new Date(selectedReport.sessionData.createdAt), "MMMM do yyyy, h:mm a")}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm font-semibold text-gray-600 border-b border-gray-100 pb-4">
              <div>
                <p className="flex items-center justify-between"><span className="text-gray-400">Doctor:</span> <span className="text-gray-900 font-bold">{selectedReport.sessionData.doctor?.name}</span></p>
                <p className="flex items-center justify-between mt-2"><span className="text-gray-400">Specialist:</span> <span className="text-blue-600 font-extrabold">{selectedReport.sessionData.doctor?.specialist}</span></p>
              </div>
              <div>
                <p className="flex items-center justify-between"><span className="text-gray-400">Patient:</span> <span className="text-gray-900 font-bold">{user?.name || "Anonymous"}</span></p>
                <p className="flex items-center justify-between mt-2"><span className="text-gray-400">Consultation Type:</span> <span className="text-gray-900">AI Telehealth Voice</span></p>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-6">
              
              {/* Chief Complaint */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chief Complaint / Symptoms</h4>
                <p className="text-gray-900 text-sm font-semibold leading-relaxed bg-blue-50/20 border border-blue-100/30 rounded-2xl p-4">
                  "{selectedReport.sessionData.symptoms}"
                </p>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Summary Overview</h4>
                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Conditions */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Potential Conditions Identified</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedReport.conditions.map((c, i) => (
                    <li key={i} className="bg-slate-50 border border-slate-100 text-gray-700 text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medicines Recommended */}
              {selectedReport.recommendedMedicines && selectedReport.recommendedMedicines.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Medications</h4>
                  <ul className="space-y-2">
                    {selectedReport.recommendedMedicines.map((med, i) => (
                      <li key={i} className="bg-emerald-50/40 border border-emerald-100/60 text-emerald-800 text-sm font-semibold rounded-xl px-4 py-3 flex gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-bold shrink-0">💊</span>
                        {med}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advice */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Advice & Recommendations</h4>
                <ul className="space-y-2">
                  {selectedReport.advice.map((a, i) => (
                    <li key={i} className="bg-slate-50 border border-slate-100 text-gray-700 text-sm font-semibold rounded-xl px-4 py-3 flex gap-2 leading-relaxed">
                      <span className="text-blue-600 font-bold shrink-0">#{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up */}
              {selectedReport.followUp && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Follow-up Plan</h4>
                  <p className="text-gray-700 text-sm leading-relaxed font-semibold">
                    {selectedReport.followUp}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Close Button */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
