import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Loader2, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);

      if (isAdminLogin) {
        if (data.user.role !== "admin") {
          toast.error("This account does not have admin privileges");
          setLoading(false);
          return;
        }
        toast.success("Welcome, Admin!");
        navigate("/admin");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-red-200/20 rounded-full blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`bg-white border rounded-3xl p-8 shadow-xl transition-all ${isAdminLogin ? 'border-red-200 shadow-red-100/50' : 'border-gray-200 shadow-gray-200/50'}`}>
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isAdminLogin ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                {isAdminLogin 
                  ? <Shield className="text-red-600" size={28} />
                  : <Stethoscope className="text-blue-600" size={28} />
                }
              </div>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {isAdminLogin ? "Admin Login" : "Welcome Back"}
          </h2>
          <p className="text-center text-gray-500 mb-8 font-medium">
            {isAdminLogin ? "Sign in to the Admin Panel" : "Sign in to your MediVoice account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all font-medium placeholder-gray-400 ${isAdminLogin ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-gray-50 border rounded-xl pl-4 pr-12 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all font-medium placeholder-gray-400 ${isAdminLogin ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4 text-white ${isAdminLogin ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isAdminLogin ? "Sign In as Admin" : "Sign In"} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <button 
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${isAdminLogin ? 'text-blue-600 hover:text-blue-700' : 'text-red-500 hover:text-red-600'}`}
            >
              {isAdminLogin ? (
                <><Stethoscope size={14} /> Sign in as User instead</>
              ) : (
                <><Shield size={14} /> Sign in as Admin</>
              )}
            </button>
          </div>

          {!isAdminLogin && (
            <p className="text-center text-gray-500 mt-6 font-medium text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Create one
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
