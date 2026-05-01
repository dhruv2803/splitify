import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { Account, Transaction, Category } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CreditCard, Landmark, ChartPie, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const qAccounts = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAccounts(data);
      setLoading(false);
    });

    const qTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(5)
    );
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
    });

    // Fetch more transactions for charts (e.g. last 6 months)
    const qAllTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubAllTransactions = onSnapshot(qAllTransactions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setAllTransactions(data);
    });

    const qCategories = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
    });

    return () => {
      unsubAccounts();
      unsubTransactions();
      unsubAllTransactions();
      unsubCategories();
    };
  }, [user]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  // Chart Data Processing
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { name: string; income: number; expense: number } } = {};
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months[key] = {
        name: date.toLocaleDateString(undefined, { month: 'short' }),
        income: 0,
        expense: 0
      };
    }

    allTransactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount;
        else months[key].expense += t.amount;
      }
    });

    return Object.values(months);
  }, [allTransactions]);

  const categoryData = useMemo(() => {
    const cats: { [key: string]: number } = {};
    allTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Other';
        cats[catName] = (cats[catName] || 0) + t.amount;
      });

    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allTransactions, categories]);

  const dailyTrendData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const last14Days = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    last14Days.forEach(dateStr => {
      days[dateStr] = 0;
    });

    allTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const dateStr = t.date.split('T')[0];
        if (days[dateStr] !== undefined) {
          days[dateStr] += t.amount;
        }
      });

    return Object.entries(days).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      amount
    }));
  }, [allTransactions]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'wallet': return WalletIcon;
      case 'card': return CreditCard;
      case 'bank': return Landmark;
      default: return WalletIcon;
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header Overview */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Summary of your financial status and activity</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('accounts')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all hover:shadow-md shadow-sm active:scale-95"
          >
            Accounts
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all hover:shadow-xl shadow-md active:scale-95"
          >
            + Transaction
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Worth Total</span>
            </div>
          </div>
          <div className={cn(
            "text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-none mb-2 truncate",
            totalBalance < 0 ? "text-red-500" : "text-slate-900"
          )}>
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">Current Liquid Assets</p>
          
          <div className="mt-8 flex items-center justify-between">
            <div className="flex -space-x-2">
              {accounts.slice(0, 4).map(a => (
                <div key={a.id} className={cn("w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm", a.color || 'bg-slate-400')}>
                  {a.name[0].toUpperCase()}
                </div>
              ))}
              {accounts.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                  +{accounts.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
              {accounts.length} Wallets
            </span>
          </div>
        </motion.div>

        {/* Income/Expense Mini Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Drift</span>
            <TrendingUp className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="h-20 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="expense" stroke="#3b82f6" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MOM Usage</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                {formatCurrency(monthlyData[monthlyData.length - 1]?.expense || 0)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-green-500 bg-green-50 px-2 py-1 rounded uppercase tracking-widest leading-none border border-green-100">
                Stable
              </span>
            </div>
          </div>
        </motion.div>

        {/* Burn Rate / Category Speed Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Focus</span>
            <ChartPie className="h-4 w-4 text-slate-300 group-hover:text-pink-500 transition-colors" />
          </div>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={22}
                    outerRadius={30}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 truncate">
                {categoryData[0]?.name || 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-80">
                {categoryData[0] ? formatCurrency(categoryData[0].value) : '$0.00'} this cycle
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-1 h-1 rounded-full overflow-hidden">
            {categoryData.length > 0 ? categoryData.map((c, i) => (
              <div 
                key={c.name} 
                className="h-full transition-all duration-500" 
                style={{ 
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  width: `${(c.value / (categoryData.reduce((a, b) => a + b.value, 0) || 1)) * 100}%`
                }}
              />
            )) : <div className="w-full bg-slate-100 rounded-full" />}
          </div>
        </motion.div>
      </section>


      {/* Main Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Expense Momentum</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rolling 14-day velocity</p>
              </div>
           </div>
           
           <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 4 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{payload[0].payload.date}</p>
                            <p className="text-sm font-black tracking-tight">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#0f172a" 
                    radius={[6, 6, 2, 2]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-pink-50 rounded-xl text-pink-600 shadow-sm border border-pink-100">
                <ChartPie className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Category Alpha</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Proportional Distribution</p>
              </div>
           </div>

           <div className="h-[240px] w-full relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">AGGREGATE</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                      {formatCurrency(categoryData.reduce((acc, curr) => acc + curr.value, 0))}
                    </p>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 ring-4 ring-slate-50/50 animate-in fade-in duration-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].name}</p>
                            <p className="text-sm font-black text-slate-900">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-auto space-y-2">
              {categoryData.slice(0, 3).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                      <span className="text-[11px] font-bold text-slate-600 truncate">{item.name}</span>
                   </div>
                   <div className="text-right shrink-0">
                      <span className="text-[11px] font-black text-slate-900 tracking-tighter">{formatCurrency(item.value)}</span>
                      <span className="text-[9px] font-black text-slate-400 ml-2 bg-slate-100 px-1 rounded">
                        {Math.round((item.value / (categoryData.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer Charts / Comparison */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
               <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full mb-6 border border-blue-100">
                  <CalendarIcon className="h-3 w-3 text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Monthly Projection</span>
               </div>
               <h2 className="text-3xl font-black tracking-tight mb-8 leading-tight text-slate-900">
                  Income vs Spending <br />
                  <span className="text-blue-600">Analysis.</span>
               </h2>
               <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Earned</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(monthlyData.reduce((a, b) => a + b.income, 0))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Spent</p>
                    <p className="text-2xl font-black text-blue-600 tracking-tighter">{formatCurrency(monthlyData.reduce((a, b) => a + b.expense, 0))}</p>
                  </div>
               </div>
            </div>

            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                       content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 ring-4 ring-slate-50/50">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{payload[0].payload.name}</p>
                              <div className="space-y-2">
                                <p className="text-xs font-black flex justify-between gap-6">
                                  <span className="text-slate-500">Income:</span>
                                  <span className="text-emerald-600">{formatCurrency(payload[0].value as number)}</span>
                                </p>
                                <p className="text-xs font-black flex justify-between gap-6">
                                  <span className="text-slate-500">Expense:</span>
                                  <span className="text-blue-600">{formatCurrency(payload[1].value as number)}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 4, 4]} barSize={20} />
                    <Bar dataKey="expense" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </section>

    </div>
  );
}

