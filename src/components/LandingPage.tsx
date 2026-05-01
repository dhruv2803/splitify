import React from 'react';
import { useAuth } from './AuthProvider';
import { motion } from 'motion/react';
import { Wallet, Users, BarChart3, ShieldCheck, Receipt, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function LandingPage() {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[120px]"></div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center relative">
               <Receipt className="text-white h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tighter">Splitify</span>
          </div>
          <button 
            onClick={handleSignIn}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl space-y-8"
        >
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
            Professional Expense Management
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
            Finance for <br />
            <span className="text-blue-600">Connected</span> Living.
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto">
            A precise, minimal interface to split bills, track shared expenses, 
            and manage personal balances without the noise.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold text-sm shadow-2xl shadow-slate-200 flex items-center justify-center transition-all hover:bg-slate-800"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
            <div className="flex items-center justify-center gap-4 py-2">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                       <img src={`https://i.pravatar.cc/40?u=${i}`} alt="Avatar" />
                    </div>
                 ))}
               </div>
               <div className="text-left">
                  <p className="text-xs font-black text-slate-900 leading-none">2,000+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Users</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl px-4"
        >
          {[
            { icon: Users, title: 'Smart Splitting', desc: 'Auto-calculate dues between friends with one tap.' },
            { icon: Wallet, title: 'Multi-Account', desc: 'Sync cards, cash, and bank balances in one place.' },
            { icon: BarChart3, title: 'Real-time Trends', desc: 'See where your money goes with instant categorization.' }
          ].map((f, i) => (
            <div key={i} className="p-8 bg-white border border-slate-200/60 rounded-2xl shadow-soft hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-2 uppercase tracking-widest">{f.title}</h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Splitify</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2024</span>
         </div>
         <div className="flex gap-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 cursor-pointer transition-colors">Documentation</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
         </div>
      </footer>
    </div>
  );
}
