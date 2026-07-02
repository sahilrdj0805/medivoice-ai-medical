import { motion } from "framer-motion";
import { Brain, Shield, Clock, Heart, Award, Sparkles } from "lucide-react";

const VALUES = [
  { icon: Brain, title: "Intelligent Matching", desc: "Using advanced AI models to suggest the best specialized assistance based on patient symptoms." },
  { icon: Shield, title: "Privacy First", desc: "Consultation history is encrypted and stored securely. Your data stays private." },
  { icon: Clock, title: "24/7 Availability", desc: "AI Doctor Specialists are ready to consult instantly at any hour of the day or night." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative pt-12">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Premium Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-lg shadow-blue-600/20 mb-12 relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-block bg-white/10 backdrop-blur-md text-blue-100 border border-white/20 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-sm uppercase tracking-widest">
              Platform Overview
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              A New Horizon in <br />Digital Health
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              MediVoice AI connects state-of-the-art voice synthesis with intelligent medical matching agents to deliver professional doctor consultations on-demand.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200/60 shadow-sm mb-12 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-950 flex items-center gap-2.5">
            <Heart className="text-red-500 fill-red-50" size={24} /> Our Mission
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
            We believe that basic health consultations should be accessible, instantaneous, and stress-free for everyone. MediVoice AI was created to bridge the gap between people and specialist information. By leveraging advanced natural language understanding and natural voice synthesis, we provide an interactive voice interface that replicates the conversational flow of speaking with a real general practitioner or specialist.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-center md:text-left">
              <p className="text-4xl font-black text-blue-600">10+</p>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-1">Specialized AI Agents</p>
            </div>
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-center md:text-left">
              <p className="text-4xl font-black text-blue-600">24/7</p>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-1">Consultation access</p>
            </div>
          </div>
        </motion.div>

        {/* Core Values Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-950 text-center md:text-left">Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-200/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${
                      idx === 0 ? "bg-blue-50 border-blue-100 text-blue-600" :
                      idx === 1 ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                      "bg-purple-50 border-purple-100 text-purple-600"
                    }`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-base mb-2 text-gray-950">{val.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed font-medium">{val.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Platform Tech Stack */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/60 shadow-sm mb-12">
          <h3 className="text-lg font-bold mb-4 text-gray-950 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} /> Platform Technology
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed mb-6 font-medium">
            MediVoice AI is built upon a high-performance MERN architecture utilizing advanced voice APIs to generate natural human speech.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {["React 19", "Node.js", "Express.js", "MongoDB Atlas", "EdgeTTS Voice API", "OpenRouter AI Models", "Stripe Gateway", "Tailwind CSS", "Framer Motion"].map((tech, idx) => (
              <span key={idx} className="bg-gray-50 border border-gray-200/60 text-gray-600 text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Compliance Alert */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
          <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center justify-center gap-1.5">
            <Award size={16} /> Educational Disclaimer
          </h4>
          <p className="text-amber-700/80 text-xs leading-relaxed font-medium">
            MediVoice AI is designed for diagnostic simulation, specialist matching training, and educational purposes. The AI specialists do not replace certified medical professionals, and consultations should not be treated as official prescription scripts or final diagnoses. In case of an emergency, please contact your local healthcare providers immediately.
          </p>
        </div>

      </div>
    </div>
  );
}
