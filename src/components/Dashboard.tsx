import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DashboardData } from '../lib/api-generated';
import { useAuth } from './AuthProvider';
import { Account, Transaction, Category } from '../types';
import { cn, formatCurrency, convertCurrency } from '../lib/utils';
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
  const { user, profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const currency = profile?.currency || 'INR';
  const format = (amt: number, curr?: string) => formatCurrency(amt, curr || currency);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const d = await api.getDashboard();
        setData(d);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading || !data) return null;

  const { netWorth, currencyTotals, monthlyStats, categorySpending, dailyTrend, accountSummaries } = data;

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
          <div className="space-y-4">
            {currencyTotals && currencyTotals.length > 0 ? currencyTotals.map((item: any) => (
              <div key={item.currency}>
                <div className={cn(
                   "text-2xl md:text-3xl font-black tracking-tighter leading-none mb-1",
                   item.amount < 0 ? "text-red-500" : "text-slate-900"
                )}>
                  {format(item.amount, item.currency)}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">
                  Balance in {item.currency}
                </p>
              </div>
            )) : (
              <div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                  {format(0)}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">No activity</p>
              </div>
            )}
          </div>
          
          {currencyTotals && currencyTotals.length > 1 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Consolidated Total</p>
               <p className="text-sm font-black text-blue-600 tracking-tight">
                  {format(netWorth || 0)}
               </p>
            </div>
          )}
          
          <div className="mt-8 flex items-center justify-between">
            <div className="flex -space-x-2">
              {(accountSummaries || []).slice(0, 4).map((a: any) => (
                <div key={a.id} className={cn("w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm", a.color || 'bg-slate-400')}>
                  {a.name[0].toUpperCase()}
                </div>
              ))}
              {accountSummaries && accountSummaries.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                  +{accountSummaries.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
              {(accountSummaries || []).length} Wallets
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
                <AreaChart data={monthlyStats}>
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
                {monthlyStats && monthlyStats.length > 0 ? format(monthlyStats[monthlyStats.length - 1]?.expense || 0) : format(0)}
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
                    data={categorySpending}
                    innerRadius={22}
                    outerRadius={30}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categorySpending.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 truncate">
                {categorySpending && categorySpending[0]?.name || 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-80">
                {categorySpending && categorySpending[0] ? format(categorySpending[0].value || 0) : format(0)}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-1 h-1 rounded-full overflow-hidden">
            {categorySpending && categorySpending.length > 0 ? categorySpending.map((c: any, i: number) => (
              <div 
                key={c.name} 
                className="h-full transition-all duration-500" 
                style={{ 
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  width: `${(c.value / ((categorySpending as any).reduce((a: any, b: any) => a + b.value, 0) || 1)) * 100}%`
                }}
              />
            )) : <div className="w-full bg-slate-100 rounded-full" />}
          </div>
        </motion.div>
      </section>


      {/* Main Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div id="chart-momentum" className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
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
                <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <p className="text-sm font-black tracking-tight">{format(payload[0].value as number)}</p>
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

        <div id="chart-categories" className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
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
                      {format(categorySpending ? categorySpending.reduce((acc: any, curr: any) => acc + (curr.value || 0), 0) : 0)}
                    </p>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categorySpending && categorySpending.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 ring-4 ring-slate-50/50 animate-in fade-in duration-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].name}</p>
                            <p className="text-sm font-black text-slate-900">{format(payload[0].value as number)}</p>
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
              {categorySpending && categorySpending.slice(0, 3).map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                      <span className="text-[11px] font-bold text-slate-600 truncate">{item.name}</span>
                   </div>
                   <div className="text-right shrink-0">
                      <span className="text-[11px] font-black text-slate-900 tracking-tighter">{format(item.value || 0)}</span>
                      <span className="text-[9px] font-black text-slate-400 ml-2 bg-slate-100 px-1 rounded">
                        {Math.round((item.value / (categorySpending.reduce((a: any, b: any) => a + (b.value || 0), 0) || 1)) * 100)}%
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer Charts / Comparison */}
      <section id="chart-comparison" className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
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
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{format(monthlyStats ? monthlyStats.reduce((a: any, b: any) => a + (b.income || 0), 0) : 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Spent</p>
                    <p className="text-2xl font-black text-blue-600 tracking-tighter">{format(monthlyStats ? monthlyStats.reduce((a: any, b: any) => a + (b.expense || 0), 0) : 0)}</p>
                  </div>
               </div>
            </div>

            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                                  <span className="text-emerald-600">{format(payload[0].value as number)}</span>
                                </p>
                                <p className="text-xs font-black flex justify-between gap-6">
                                  <span className="text-slate-500">Expense:</span>
                                  <span className="text-blue-600">{format(payload[1].value as number)}</span>
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

