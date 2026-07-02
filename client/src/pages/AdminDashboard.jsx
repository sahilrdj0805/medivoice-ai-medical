import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Loader2, Plus, Pencil, Trash2, X, Shield, Stethoscope, Save, LogOut, Users, Activity, Volume2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const VOICE_OPTIONS = [
  { value: "en-US-AriaNeural", label: "Aria (US Female)" },
  { value: "en-US-GuyNeural", label: "Guy (US Male)" },
  { value: "en-US-JennyNeural", label: "Jenny (US Female)" },
  { value: "en-US-ChristopherNeural", label: "Christopher (US Male)" },
  { value: "en-US-AmberNeural", label: "Amber (US Female)" },
  { value: "en-GB-RyanNeural", label: "Ryan (UK Male)" },
  { value: "en-GB-SoniaNeural", label: "Sonia (UK Female)" },
  { value: "en-IN-NeerjaNeural", label: "Neerja (IN Female)" },
  { value: "en-AU-WilliamNeural", label: "William (AU Male)" },
  { value: "en-CA-LiamNeural", label: "Liam (CA Male)" },
];

const emptyForm = {
  specialist: "",
  name: "",
  image: "",
  voice: "en-US-AriaNeural",
  agentPrompt: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null); // null = creating new
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // doctor object being deleted

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/admin/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDoctor(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      specialist: doctor.specialist,
      name: doctor.name,
      image: doctor.image || "",
      voice: doctor.voice || "en-US-AriaNeural",
      agentPrompt: doctor.agentPrompt,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.specialist.trim() || !form.name.trim() || !form.agentPrompt.trim()) {
      toast.error("Specialist, Name, and Agent Prompt are required");
      return;
    }

    setSaving(true);
    try {
      if (editingDoctor) {
        const res = await api.put(`/admin/doctors/${editingDoctor._id}`, form);
        setDoctors(prev => prev.map(d => d._id === editingDoctor._id ? res.data : d));
        toast.success("Doctor updated successfully");
      } else {
        const res = await api.post("/admin/doctors", form);
        setDoctors(prev => [res.data, ...prev]);
        toast.success("Doctor created successfully");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save doctor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/admin/doctors/${deleteTarget._id}`);
      setDoctors(prev => prev.filter(d => d._id !== deleteTarget._id));
      toast.success("Doctor deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete doctor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative pt-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Premium Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 md:p-10 text-white shadow-lg shadow-red-600/20 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Shield size={20} />
              </div>
              <span className="text-red-100 font-bold uppercase tracking-widest text-xs">MediVoice System Control</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Admin Control Center</h1>
            <p className="text-red-100 text-base max-w-xl leading-relaxed">
              Dynamically add, update, and manage your AI medical specialists and configure their custom voice profiles.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-3.5 rounded-xl font-bold border border-white/15 transition-all text-sm flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
            <button 
              onClick={openCreateModal}
              className="bg-white text-red-600 hover:bg-red-50 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl hover:shadow-2xl whitespace-nowrap flex items-center gap-2 border border-red-100"
            >
              <Plus size={18} /> Add Specialist
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Agents</p>
              <p className="text-3xl font-extrabold text-gray-900">{doctors.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Departments</p>
              <p className="text-3xl font-extrabold text-gray-900">{new Set(doctors.map(d => d.specialist)).size}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={22} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">EdgeTTS Voices</p>
              <p className="text-3xl font-extrabold text-gray-900">{new Set(doctors.map(d => d.voice)).size}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Volume2 size={22} />
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-[2rem] bg-white/50 backdrop-blur-sm p-16 flex flex-col items-center justify-center text-center">
            <Stethoscope size={48} className="text-gray-300 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Specialists Setup</h3>
            <p className="text-gray-500 mb-6 max-w-sm text-sm">Add your first AI Doctor Agent to make it available for patient consultation.</p>
            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md">
              <Plus size={18} /> Configure First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc._id} className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                      {doc.image ? (
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-16 h-16 rounded-2xl bg-gray-50 object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                          <Stethoscope size={24} />
                        </div>
                      )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-950 leading-tight mb-1">{doc.name}</h3>
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{doc.specialist}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3.5 mb-4 border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Volume2 size={12} className="text-blue-500" /> Voice configuration
                    </p>
                    <p className="text-gray-700 text-xs font-bold truncate">
                      {VOICE_OPTIONS.find(v => v.value === doc.voice)?.label || doc.voice}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Activity size={12} className="text-indigo-500" /> Instructions prompt
                    </p>
                    <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed font-medium">
                      {doc.agentPrompt}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-2.5 rounded-xl text-xs font-bold border border-gray-200/60 hover:border-blue-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={14} /> Edit Agent
                  </button>
                  <button
                    onClick={() => setDeleteTarget(doc)}
                    className="bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 p-2.5 rounded-xl border border-gray-200/60 hover:border-red-200 transition-colors"
                    title="Delete Doctor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Specialist Title *</label>
                      <input
                        type="text"
                        value={form.specialist}
                        onChange={(e) => setForm(f => ({ ...f, specialist: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700"
                        placeholder="e.g. Cardiologist"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Doctor Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700"
                        placeholder="e.g. Dr. John Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Avatar Image URL</label>
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700 text-sm"
                        placeholder="Leave blank for auto-generated avatar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Voice Model</label>
                      <select
                        value={form.voice}
                        onChange={(e) => setForm(f => ({ ...f, voice: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700"
                      >
                        {VOICE_OPTIONS.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Agent Prompt *</label>
                    <textarea
                      value={form.agentPrompt}
                      onChange={(e) => setForm(f => ({ ...f, agentPrompt: e.target.value }))}
                      className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium text-gray-700 text-sm leading-relaxed"
                      placeholder="Describe how this AI doctor should behave, their expertise, and interaction style..."
                    />
                    <p className="text-xs text-gray-400 mt-1.5 font-medium">This prompt defines the doctor's personality, expertise, and consultation style.</p>
                  </div>

                  {/* Image Preview */}
                  {(form.image || form.name) && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={form.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name.replace(/\s/g, "")}`}
                        alt="Preview"
                        className="w-14 h-14 rounded-full bg-white object-cover border border-gray-200 shadow-sm"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{form.name || "Doctor Name"}</p>
                        <p className="text-sm text-gray-500">{form.specialist || "Specialization"}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingDoctor ? "Save Changes" : "Create Doctor"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-950 leading-tight">Delete Specialist?</h2>
                    <p className="text-sm text-gray-500 font-medium">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6">
                Are you sure you want to delete <strong className="text-gray-900">{deleteTarget.name}</strong> from the team? Patients will no longer be able to initiate consultations with this specialist.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-500/10"
                >
                  Delete Agent
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
