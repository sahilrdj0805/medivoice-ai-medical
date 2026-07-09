import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Mic, FileText, Shield, ChevronRight, Stethoscope, Play, Pause } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: Brain, title: "AI Diagnosis", desc: "Describe symptoms and get matched to the right specialist instantly." },
  { icon: Mic, title: "Voice Consultation", desc: "Talk naturally with your AI doctor. Fully two-way voice conversation." },
  { icon: FileText, title: "Session Report", desc: "Get a detailed PDF report summarising every consultation." },
  { icon: Shield, title: "100 Free Credits", desc: "Start for free. Every new account gets 100 consultation credits." },
];



export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const [rotateX, setRotateX] = useState(6);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rX = 6 - (y / box.height) * 15;
    const rY = (x / box.width) * 25;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(6);
    setRotateY(0);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl -z-10"></div>

      {/* Hero */}
      <section className="text-center px-6 pt-24 pb-20 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm uppercase tracking-wider">
            🩺 AI-Powered Medical Consultations
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight text-gray-950">
            Your Personal
            <span className="block text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Doctor
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Describe your symptoms, get matched to a specialist, and have a real voice conversation with an AI doctor — anytime, anywhere.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={user ? "/dashboard" : "/register"}>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-md flex items-center gap-2"
              >
                Get Started Free <ChevronRight size={18} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl font-bold text-base border border-gray-200 text-gray-700 hover:border-gray-300 transition-all bg-white shadow-sm"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Video 3D Laptop Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="mt-20 max-w-3xl mx-auto px-4 relative"
        >
          {/* Laptop Screen Bezel (Tilted dynamically in 3D based on cursor movement) */}
          <div 
            className="relative bg-slate-900 border-[12px] border-slate-950 rounded-t-2xl shadow-2xl overflow-hidden aspect-video transition-transform duration-300 ease-out"
            style={{ 
              transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, 
              transformOrigin: "bottom center" 
            }}
          >
            {/* Webcam Indicator */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-700 z-30 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-blue-500/80" />
            </div>

            {/* Video Player */}
            <video 
              ref={videoRef}
              playsInline
              className="w-full h-full object-cover relative z-10"
              poster="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => {
                if (videoRef.current && videoRef.current.currentTime !== 0) {
                  videoRef.current.currentTime = 0;
                }
                setIsPlaying(false);
              }}
              onEnded={handleVideoEnded}
            >
              <source src="/doctor_welcome.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Play Overlay Button */}
            {!isPlaying && (
              <div 
                onClick={handlePlayPause}
                className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/40 backdrop-blur-[2px] cursor-pointer group transition-all duration-300"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, backgroundColor: "#3b82f6" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30 transition-all"
                >
                  <Play size={36} fill="white" className="ml-1" />
                </motion.div>
              </div>
            )}
          </div>

          {/* Laptop Base (Keyboard Part) */}
          <div 
            className="relative h-4 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-t border-white rounded-b-2xl shadow-xl flex justify-center items-center z-20"
            style={{
              transform: "perspective(1200px) rotateX(1deg)",
              transformOrigin: "top center"
            }}
          >
            {/* Display opening notch/trackpad indicator */}
            <div className="w-24 h-2 bg-slate-400/40 rounded-b-lg border-b border-slate-500/30 shadow-inner" />
          </div>

          {/* Simulated shadow beneath the base */}
          <div className="absolute -bottom-5 left-[8%] right-[8%] h-8 bg-slate-950/20 rounded-full blur-lg -z-10" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto bg-gray-50 border border-gray-200/50 rounded-[3rem] mb-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 text-gray-950">Engineered for Smart Care</h2>
        <p className="text-gray-500 text-center max-w-md mx-auto mb-16 font-medium text-sm md:text-base">Experience a frictionless health check-up workflow powered by advanced AI.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200/50 shadow-sm rounded-3xl p-8 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-6">
                 <f.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-950">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3 text-gray-950">How It Works</h2>
          <p className="text-gray-500 text-center mb-16 font-medium">Consult with your specialist in three simple steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-8 bg-gray-50/50 border border-gray-200/50 rounded-3xl relative hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-6 shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-950 mb-2">Submit Symptoms</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Describe how you're feeling to our intelligent AI assistant in your own words.</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center p-8 bg-gray-50/50 border border-gray-200/50 rounded-3xl relative hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-6 shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-950 mb-2">Connect Instantly</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Get automatically routed to the perfect specialist doctor matching your symptoms.</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center p-8 bg-gray-50/50 border border-gray-200/50 rounded-3xl relative hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-6 shadow-md shadow-blue-500/20">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-950 mb-2">Voice Consultation</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Have a natural two-way voice conversation and instantly view your summary report.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="text-center px-8 py-16 mb-20 max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-blue-600/10 relative overflow-hidden">
        {/* Background design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight relative z-10">Start Your First Consultation</h2>
        <p className="text-blue-100 text-sm md:text-base mb-10 max-w-lg mx-auto font-medium relative z-10">Get 100 free credits on sign-up. Consult with specialized AI doctors and download detailed summaries instantly.</p>
        <div className="relative z-10">
          <Link to={user ? "/dashboard" : "/register"}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-white hover:bg-gray-50 text-blue-700 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              Get Started — It's Free
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 px-6 py-8 text-center text-gray-400 text-sm bg-gray-50/50">
        <div className="flex items-center justify-center gap-2">
          <Stethoscope size={18} className="text-gray-400" />
          <span className="font-bold text-gray-700">MediVoice AI</span>
        </div>
      </footer>
    </div>
  );
}
