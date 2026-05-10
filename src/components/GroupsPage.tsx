import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';
import { Users, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function GroupsPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 relative z-10 animate-pulse">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg z-20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-3xl opacity-20 scale-150"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Collaborative <br />
            <span className="text-blue-600">Split-Flow</span> Coming Soon.
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            We're re-engineering the way you split bills with friends. A more powerful, automated, and secure group expense engine is currently in the forge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: Zap, title: "Instant Split", desc: "Atomic bill division across any number of members." },
            { icon: MessageSquare, title: "Chat context", desc: "Discuss specific expenses within the transaction thread." },
            { icon: ShieldCheck, title: "Auto-Settle", desc: "One-tap settlements via connected banking hubs." }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <feature.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1">{feature.title}</h4>
              <p className="text-[10px] font-medium text-slate-400 leading-normal uppercase tracking-wider">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 flex flex-col items-center gap-4">
           <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-50 bg-slate-200 overflow-hidden shadow-sm">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-slate-50 bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                 +1.2k
              </div>
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join 1,200+ users on the waitlist</p>
           <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              Notify Me When Live
           </button>
        </div>
      </motion.div>
    </div>
  );
}
