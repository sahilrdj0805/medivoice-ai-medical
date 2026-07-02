import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Loader2, FileText, ArrowLeft, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { useAuth } from "../context/AuthContext";

export default function ChatSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const chatEndRef = useRef(null);
  const [typingMessage, setTypingMessage] = useState(null);
  const [viewMode, setViewMode] = useState("chat");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const greetingTriggered = useRef(false);

  useEffect(() => {
    // Fetch session details
    api.get(`/sessions/${id}`)
      .then(res => {
        setSession(res.data);
        if (res.data.status !== "ended") {
            if (res.data.messages.length === 0 && !greetingTriggered.current) {
               greetingTriggered.current = true;
               const userSymptoms = res.data.symptoms ? res.data.symptoms.trim() : "some symptoms";
               const greeting = `Hello, I'm ${res.data.doctor.name}. I understand you're experiencing: ${userSymptoms}. Could you elaborate a bit more on how you're feeling today?`;
               speak(greeting, () => {
                   setSession(prev => ({ ...prev, messages: [...prev.messages, { role: "assistant", content: greeting }] }));
                   setTypingMessage(null);
               }, (duration) => {
                   setTypingMessage({ content: greeting, displayed: "", duration });
               }, res.data.doctor.voice);
            }
        }
      })
      .catch(err => {
        toast.error("Failed to load session");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
     if (!typingMessage) return;
     
     const { content, displayed, duration } = typingMessage;
     if (displayed.length === content.length) return;
     
     // Calculate ms per character based on total duration of audio
     const msPerChar = (duration * 1000) / content.length;
     
     const timeoutId = setTimeout(() => {
         setTypingMessage(prev => {
             if (!prev) return null;
             return {
                 ...prev,
                 displayed: content.slice(0, prev.displayed.length + 1)
             };
         });
     }, msPerChar);
     
     return () => clearTimeout(timeoutId);
  }, [typingMessage]);

  const {
    isListening,
    isSpeaking,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    clearTranscript,
    speak,
    stopSpeaking
  } = useVoiceChat(session?.doctor?.voice);

  // Auto scroll to bottom (deferred slightly to ensure layout has fully rendered)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [session?.messages, transcript, aiThinking, typingMessage?.displayed]);

  const handleStopListening = async () => {
    const text = stopListening();
    if (!text.trim()) return;

    clearTranscript();

    // Show raw transcript immediately to the user
    const newUserMsg = { role: "user", content: text, _id: Date.now().toString() };
    setSession(prev => ({ ...prev, messages: [...prev.messages, newUserMsg] }));
    
    setAiThinking(true);
    try {
      const saveRes = await api.post(`/sessions/${id}/messages`, { role: "user", content: text });
      const savedSession = saveRes.data;
      
      // Sync local state with the corrected transcript returned by the backend
      setSession(savedSession);
      
      const recentMessages = savedSession.messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
      }));
      
      const aiRes = await api.post("/ai/chat", {
        messages: recentMessages,
        agentPrompt: session?.doctor?.agentPrompt
      });
      
      const aiReplyText = aiRes.data.reply;
      const updatedSession = await api.post(`/sessions/${id}/messages`, { role: "assistant", content: aiReplyText });
      
      speak(
          aiReplyText, 
          () => {
              // On audio end
              setSession(updatedSession.data);
              setTypingMessage(null);
          },
          (duration) => {
              // On audio start playing
              setAiThinking(false);
              setTypingMessage({ content: aiReplyText, displayed: "", duration });
          }
      );

    } catch (err) {
      toast.error("Failed to process message");
      setAiThinking(false);
    }
  };

  // Auto submit on silence (1.5 seconds of quiet) OR when browser stops listening
  useEffect(() => {
    if (!isListening) {
      if (transcript.trim()) {
        handleStopListening();
      }
      return;
    }

    // Only count down if the user has actually started speaking!
    if (!transcript.trim()) return;

    const timeoutId = setTimeout(() => {
      handleStopListening();
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [transcript, isListening]);

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="text-blue-600 animate-spin" size={40} />
    </div>
  );

  const endSession = async () => {
    setShowDisconnectConfirm(false);
    stopListening();
    stopSpeaking();
    setLoading(true);
    
    try {
        toast.loading("Ending session...", { id: "report" });
        const reportRes = await api.post("/ai/generate-report", {
            messages: session.messages,
            doctorName: session.doctor.name,
            specialist: session.doctor.specialist,
            symptoms: session.symptoms
        });
        
        const endRes = await api.put(`/sessions/${id}/end`, { report: reportRes.data });
        setSession(endRes.data);
        toast.success("Session ended", { id: "report" });
        setViewMode("report");
        setLoading(false);
    } catch (err) {
        toast.error("Failed to end session cleanly", { id: "report" });
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-tr from-gray-50 via-slate-50 to-blue-50/20 py-4 px-4 flex justify-center items-center">
      
      {/* Main Glassmorphic Chat Frame */}
      <div className="w-full max-w-4xl bg-white border border-gray-200/80 rounded-3xl shadow-xl shadow-slate-200/30 flex flex-col h-[calc(100vh-140px)] max-h-[720px] min-h-[500px] relative overflow-hidden">
        
        {/* Doctor Header Banner */}
        <div className="bg-white border-b border-gray-150 p-5 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              {session?.doctor.image ? (
                <img 
                  src={session.doctor.image} 
                  alt={session.doctor.name} 
                  className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100 object-cover" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Stethoscope size={20} />
                </div>
              )}
              {isSpeaking && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-60 pointer-events-none"
                />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-gray-950 text-base leading-tight">{session?.doctor.name}</h2>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wide border border-blue-100">
                  {session?.doctor.specialist}
                </span>
              </div>
              <p className="text-gray-400 text-xs font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Medical Consultation
              </p>
            </div>
          </div>

          {/* Active Call Status Info */}
          <div className="flex items-center gap-4">
            {/* Embedded Mini Audio Waveform Activity */}
            {(isSpeaking || isListening || aiThinking) ? (
              <div className="flex items-center gap-0.5 h-6">
                {isSpeaking ? (
                  [1, 2, 3, 2, 1].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: ["6px", "18px", "6px"] }}
                      transition={{ repeat: Infinity, duration: 1, delay: idx * 0.1 }}
                      className="w-0.75 bg-blue-500 rounded-full"
                    />
                  ))
                ) : isListening ? (
                  [1, 2, 3, 2, 1].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: ["6px", "18px", "6px"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: idx * 0.08 }}
                      className="w-0.75 bg-emerald-500 rounded-full"
                    />
                  ))
                ) : (
                  [1, 1, 1, 1, 1].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ scaleY: [1, 1.6, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.15 }}
                      className="w-0.75 h-3 bg-indigo-400 rounded-full"
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transcript Conversation Area / Diagnostic Report */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50 flex flex-col scroll-smooth">
          
          {viewMode === "report" && session?.report ? (
            /* --- INLINE DIAGNOSTIC REPORT VIEW --- */
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-2xl mx-auto w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="text-center pb-4 border-b border-gray-100">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-150">
                  Diagnostic Consultation Summary
                </span>
                <h3 className="text-xl font-black text-gray-950 mt-3">Final Medical Report</h3>
                <p className="text-gray-400 text-xs mt-1">Compiled dynamically by {session?.doctor?.name}</p>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Summary Overview</h4>
                <p className="text-gray-700 text-sm leading-relaxed bg-blue-50/30 border border-blue-100/30 rounded-2xl p-4 font-semibold">
                  {session.report.summary}
                </p>
              </div>

              {/* Conditions */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Potential Diagnoses</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {session.report.conditions.map((c, i) => (
                    <li key={i} className="bg-slate-50 border border-slate-100 text-gray-700 text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medicines Recommended */}
              {session.report.recommendedMedicines && session.report.recommendedMedicines.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Medications</h4>
                  <ul className="space-y-2">
                    {session.report.recommendedMedicines.map((med, i) => (
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
                  {session.report.advice.map((a, i) => (
                    <li key={i} className="bg-slate-50 border border-slate-100 text-gray-700 text-sm font-semibold rounded-xl px-4 py-3 flex gap-2 leading-relaxed">
                      <span className="text-blue-600 font-bold shrink-0">#{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up */}
              {session.report.followUp && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Follow-up Instructions</h4>
                  <p className="text-gray-700 text-sm leading-relaxed font-semibold">
                    {session.report.followUp}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* --- STANDARD CHAT TRANSCRIPT BUBBLES --- */
            <>
              {/* Symptoms Welcome Toast */}
              <div className="self-center bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-center max-w-xl shadow-sm mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Chief Complaint</span>
                <p className="text-blue-900/80 text-sm font-semibold leading-relaxed">
                  "{session?.symptoms}"
                </p>
              </div>

              {session?.messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
                  >
                    {/* Avatar Icon */}
                    {!isUser ? (
                      session?.doctor.image ? (
                        <img 
                          src={session.doctor.image} 
                          alt="Doctor" 
                          className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0 object-cover" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Stethoscope size={14} />
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0 uppercase">
                        {user?.name?.charAt(0)}
                      </div>
                    )}

                    {/* Speech Bubble */}
                    <div 
                      className={`px-4.5 py-3 rounded-2xl text-sm md:text-base font-medium leading-relaxed shadow-sm ${
                        isUser 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing/Streaming Message */}
              {typingMessage && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <img 
                    src={session?.doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.doctor.name}`} 
                    alt="Doctor" 
                    className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0 object-cover" 
                  />
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-none px-4.5 py-3 shadow-sm text-sm md:text-base font-medium leading-relaxed">
                    {typingMessage.displayed}
                    <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />
                  </div>
                </div>
              )}

              {/* User Spoken Live Transcript */}
              <AnimatePresence>
                {isListening && transcript && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    className="flex gap-3 max-w-[85%] self-end flex-row-reverse"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0 uppercase">
                      {user?.name?.charAt(0)}
                    </div>
                    <div className="bg-blue-500/90 text-white rounded-2xl rounded-tr-none px-4.5 py-3 shadow-sm text-sm md:text-base font-medium leading-relaxed animate-pulse">
                      {transcript}
                      <span className="inline-block w-1.5 h-4 bg-white/70 animate-pulse ml-1 align-middle" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thinking Status */}
              {aiThinking && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  {session?.doctor.image ? (
                    <img 
                      src={session.doctor.image} 
                      alt="Doctor" 
                      className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0 object-cover animate-pulse" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 animate-pulse">
                      <Stethoscope size={14} />
                    </div>
                  )}
                  <div className="bg-white border border-gray-200 text-gray-400 rounded-2xl rounded-tl-none px-4.5 py-3 shadow-sm text-sm font-semibold flex items-center gap-2">
                    <span>Thinking</span>
                    <div className="flex gap-0.5 items-center h-4 ml-1">
                      {[0.4, 0.4, 0.4, 0.4, 0.4].map((val, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ scaleY: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.15 }}
                          className="w-0.75 h-3 bg-indigo-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-white border-t border-gray-150 p-6 flex flex-col items-center justify-center gap-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-10">
          {voiceError && <p className="text-red-500 text-xs font-semibold">{voiceError}</p>}
          
          {session?.status === "active" ? (
            <div className="flex items-center gap-6">
              
              {/* Mic / Speak Toggle Button */}
              <button
                onClick={() => {
                  if (isListening) {
                    handleStopListening();
                  } else {
                    startListening();
                  }
                }}
                disabled={aiThinking || isSpeaking}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                } disabled:opacity-50 disabled:scale-100 disabled:bg-gray-200 disabled:text-gray-400`}
                title={isListening ? "Tap to Mute/Stop" : "Tap to Speak"}
              >
                <div className="relative flex items-center justify-center">
                  {isListening ? (
                    /* Stop icon */
                    <div className="w-4 h-4 bg-white rounded-sm" />
                  ) : (
                    /* Microphone icon */
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Disconnect Call Button */}
              <button 
                onClick={() => setShowDisconnectConfirm(true)}
                className="bg-red-100 hover:bg-red-200 hover:scale-105 text-red-600 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm border border-red-200 cursor-pointer"
                title="Disconnect Call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                Consultation Concluded
              </span>
              
              <div className="flex items-center gap-4">
                {session?.report && (
                  <button 
                    onClick={() => setViewMode(viewMode === "chat" ? "report" : "chat")}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <FileText size={18} /> 
                    {viewMode === "chat" ? "View Diagnostic Report" : "View Chat Transcript"}
                  </button>
                )}
                
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-gray-100 hover:bg-gray-250 text-gray-800 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styled Disconnect Confirm Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full border border-gray-200/80 shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 text-red-600 mb-5">
              <PhoneOff size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-xl mb-2">End Consultation?</h3>
            <p className="text-gray-500 font-semibold text-sm leading-relaxed mb-6">
              This will disconnect the voice call, save your transcript, and generate your final diagnostic report immediately.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={endSession}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-red-500/10 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
