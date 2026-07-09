import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Stethoscope, Loader2, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/85 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <Stethoscope className="text-blue-600 group-hover:rotate-12 transition-transform duration-300" size={28} />
        <span className="text-xl font-bold text-gray-950 tracking-tight">
          MediVoice <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
        </span>
      </Link>

      {/* Center Links */}
      {location.pathname !== "/" && (
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[
            { path: "/dashboard", label: "Dashboard" },
            { path: "/history", label: "Reports" },
            { path: "/pricing", label: "Pricing" },
            { path: "/profile", label: "Profile" },
            { path: "/about", label: "About" },
            ...(user?.role === "admin" ? [{ path: "/admin", label: "Admin Panel" }] : []),
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative py-1.5 transition-colors duration-200 ${
                isActive(link.path) ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Right Side - Avatar */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-24 h-9 flex items-center justify-end pr-2">
            <Loader2 className="animate-spin text-blue-600" size={18} />
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-blue-700 font-bold text-xs">{user.credits ?? 0}</span>
              <span className="text-blue-600 text-[9px] font-extrabold uppercase tracking-wider">Credits</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout} 
                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md">
                Sign Up Free
              </Link>
            </motion.div>
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        {location.pathname !== "/" && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 focus:outline-none cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && location.pathname !== "/" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-lg z-40 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-4 font-semibold text-sm">
              {[
                { path: "/dashboard", label: "Dashboard" },
                { path: "/history", label: "Reports" },
                { path: "/pricing", label: "Pricing" },
                { path: "/profile", label: "Profile" },
                { path: "/about", label: "About" },
                ...(user?.role === "admin" ? [{ path: "/admin", label: "Admin Panel" }] : []),
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`py-2.5 border-b border-gray-100/50 last:border-0 transition-colors ${
                    isActive(link.path) ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
