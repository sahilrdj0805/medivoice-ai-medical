import { useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Loader2, Check, CreditCard, Sparkles, Zap, Flame } from "lucide-react";

const PACKAGES = [
  {
    id: "bronze",
    name: "Bronze Starter",
    credits: 50,
    price: "$5",
    description: "Great for quick symptoms check and short consultations.",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/10",
    features: [
      "5 full consultations (10 credits each)",
      "Standard AI Response speed",
      "Symptom matching suggestions",
      "Full session reports & diagnosis",
    ]
  },
  {
    id: "silver",
    name: "Silver Popular",
    credits: 150,
    price: "$10",
    description: "Perfect for ongoing medical triage and treatment advice.",
    icon: Flame,
    color: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/15",
    popular: true,
    features: [
      "15 full consultations (10 credits each)",
      "Faster response matching priority",
      "Access to all 10 specialists",
      "Dynamic reports & advice logs",
      "No expiration on credits",
    ]
  },
  {
    id: "gold",
    name: "Gold Unlimited",
    credits: 500,
    price: "$25",
    description: "Ideal for families or individuals needing high volume consultations.",
    icon: Sparkles,
    color: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/10",
    features: [
      "50 full consultations (10 credits each)",
      "Top priority response matching",
      "Premium customer support",
      "Unlimited report generation",
      "Share credits with family",
    ]
  }
];

export default function Pricing() {
  const [loadingPack, setLoadingPack] = useState(null);

  const handleCheckout = async (packId) => {
    setLoadingPack(packId);
    try {
      const res = await api.post("/payments/create-checkout-session", { packName: packId });
      
      // Redirect to Stripe Checkout page directly
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to generate payment page");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-sm uppercase tracking-widest">
            Credits & Upgrades
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-950">
            Simple, Transparent <span className="text-blue-600">Pricing</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed font-medium">
            No monthly subscriptions or hidden fees. Buy credits when you need them. 10 credits are consumed per consultation session.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {PACKAGES.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <div 
                key={pkg.id} 
                className={`relative bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  pkg.popular 
                    ? "border-blue-500 shadow-md ring-4 ring-blue-500/5 shadow-blue-500/5 scale-105 z-10" 
                    : "border-gray-200/80 shadow-sm"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  {/* Top Details */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-left">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">{pkg.name}</p>
                      <h3 className="text-3xl font-black text-gray-900 leading-none">{pkg.credits} Credits</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pkg.color} text-white flex items-center justify-center shadow-lg ${pkg.shadow}`}>
                      <IconComponent size={22} />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-black text-gray-950 tracking-tight">{pkg.price}</span>
                    <span className="text-gray-400 text-sm font-semibold">one-time</span>
                  </div>

                  <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                    {pkg.description}
                  </p>

                  <hr className="border-gray-100 mb-8" />

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                        <div className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={loadingPack !== null}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                    pkg.popular 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {loadingPack === pkg.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  Buy Credits
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ/Notice footer */}
        <div className="text-center mt-16 max-w-xl mx-auto">
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Payments are processed securely via Stripe. Your account will be instantly credited upon success redirect. For assistance, reach out to our dedicated support.
          </p>
        </div>

      </div>
    </div>
  );
}
