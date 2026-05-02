import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, writeBatch, doc, where, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { toast } from 'react-hot-toast';
import { Shield, Database, RefreshCw, AlertCircle, CheckCircle2, Users as UsersIcon, UserCheck, UserMinus, Search, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, CURRENCIES } from '../types';

export function AdminPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, accounts: 0, transactions: 0, groupExpenses: 0 });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'users' | 'migration'>('stats');

  // Fix Tool State
  const [fixUserId, setFixUserId] = useState('');
  const [fixFromCurrency, setFixFromCurrency] = useState('INR');
  const [fixToCurrency, setFixToCurrency] = useState('INR');

  useEffect(() => {
    if (!profile?.isAdmin) return;
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const collectionsNames = ['users', 'accounts', 'transactions', 'groupExpenses'];
      const results = await Promise.all(collectionsNames.map(c => getDocs(collection(db, c))));
      
      const usersData = results[0].docs.map(d => d.data() as UserProfile);
      setAllUsers(usersData);

      setStats({
        users: results[0].size,
        accounts: results[1].size,
        transactions: results[2].size,
        groupExpenses: results[3].size
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean | undefined) => {
    if (userId === user?.uid) {
      toast.error("You cannot remove your own admin status");
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus
      });
      toast.success("User status updated");
      fetchData(); // refresh
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    }
  };

  const runMigration = async () => {
    if (!window.confirm("This will add default currencies to all documents missing them. Continue?")) return;
    
    setMigrating(true);
    setMigrationStatus("Scanning for documents...");
    
    try {
      let totalUpdated = 0;
      const collectionsToPatch = ['accounts', 'transactions', 'groupExpenses'];
      
      const userCurrencyMap: Record<string, string> = {};
      allUsers.forEach(u => {
        userCurrencyMap[u.uid] = u.currency || 'INR';
      });

      for (const colName of collectionsToPatch) {
        setMigrationStatus(`Processing ${colName}...`);
        const snapshot = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        let batchCount = 0;
        
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.currency) {
            const ownerCurrency = userCurrencyMap[data.userId] || 'INR';
            batch.update(doc(db, colName, docSnap.id), { currency: ownerCurrency });
            batchCount++;
          }
        });

        if (batchCount > 0) {
          await batch.commit();
          totalUpdated += batchCount;
        }
      }

      setMigrationStatus(`Successfully updated ${totalUpdated} records.`);
      toast.success(`Migration complete: ${totalUpdated} records updated`);
      fetchData();
    } catch (err) {
      console.error("Migration error:", err);
      setMigrationStatus("Migration failed. See console.");
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  const runFix = async () => {
    if (!fixUserId) {
        toast.error("Please select a user");
        return;
    }
    if (!window.confirm(`Swap all ${fixFromCurrency} records to ${fixToCurrency} for this user?`)) return;
    
    setMigrating(true);
    setMigrationStatus("Fixing records...");
    
    try {
      let totalUpdated = 0;
      const collectionsToPatch = ['accounts', 'transactions', 'groupExpenses'];
      
      for (const colName of collectionsToPatch) {
        const q = query(
            collection(db, colName), 
            where('userId', '==', fixUserId),
            where('currency', '==', fixFromCurrency)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let batchCount = 0;
        
        snapshot.forEach(docSnap => {
            batch.update(doc(db, colName, docSnap.id), { currency: fixToCurrency });
            batchCount++;
        });

        if (batchCount > 0) {
          await batch.commit();
          totalUpdated += batchCount;
        }
      }

      setMigrationStatus(`Successfully swapped ${totalUpdated} records.`);
      toast.success(`Fix complete: ${totalUpdated} records updated`);
    } catch (err) {
      console.error("Fix error:", err);
      setMigrationStatus("Fix failed. See console.");
      toast.error("Fix failed");
    } finally {
      setMigrating(false);
    }
  };

  if (!profile?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-slate-100 shadow-xl">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-center max-w-xs">This section is restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Admin Panel</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">System health and management</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("w-5 h-5 text-slate-600", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'stats', label: 'Overview', icon: Database },
          { id: 'users', label: 'Users', icon: UsersIcon },
          { id: 'migration', label: 'Tools', icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeSubTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {[
            { label: 'Total Users', value: stats.users, color: 'text-blue-600', icon: Database },
            { label: 'Accounts', value: stats.accounts, color: 'text-emerald-600', icon: Database },
            { label: 'Transactions', value: stats.transactions, color: 'text-rose-600', icon: Database },
            { label: 'Expenses', value: stats.groupExpenses, color: 'text-amber-600', icon: Database },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
              </div>
              <stat.icon className="absolute -bottom-2 -right-2 w-12 h-12 text-slate-50 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-xl font-black tracking-tighter text-slate-900">User Management</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage permissions and roles</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                          {u.photoURL ? <img src={u.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{u.displayName?.[0] || u.email?.[0] || '?'}</div>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{u.displayName || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500 font-mono opacity-60">{u.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                           Regular User
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      {u.uid !== user?.uid && (
                        <button
                          onClick={() => toggleAdmin(u.uid, u.isAdmin)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            u.isAdmin 
                              ? "text-red-500 hover:bg-red-50 bg-red-50/50" 
                              : "text-blue-600 hover:bg-blue-50 bg-blue-50/50"
                          )}
                          title={u.isAdmin ? "Remove Admin" : "Make Admin"}
                        >
                          {u.isAdmin ? <UserMinus className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'migration' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <RefreshCw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter text-slate-900">Legacy Migration</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Initial Setup</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 italic bg-slate-50 p-4 rounded-xl border-l-4 border-amber-400">
               Adds preferred currency to any records missing one. Safe to run multiple times.
            </p>
            <button 
              onClick={runMigration}
              disabled={migrating}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Run Global Migration
            </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter text-slate-900">Currency Swap (Bulk Fix)</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Correct Migration Errors</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target User</label>
                    <select 
                        value={fixUserId} 
                        onChange={(e) => setFixUserId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-900"
                    >
                        <option value="">Select User</option>
                        {allUsers.map(u => <option key={u.uid} value={u.uid}>{u.displayName || u.email} ({u.uid.slice(0, 5)})</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">From</label>
                        <select 
                            value={fixFromCurrency} 
                            onChange={(e) => setFixFromCurrency(e.target.value)}
                            className="w-full bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-3 text-sm font-black"
                        >
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                    </div>
                    <div className="pt-6">
                        <ArrowRight className="text-slate-300 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">To</label>
                        <select 
                            value={fixToCurrency} 
                            onChange={(e) => setFixToCurrency(e.target.value)}
                            className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-3 text-sm font-black"
                        >
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {migrationStatus && (
                <div className="p-4 bg-slate-900 text-white rounded-xl mb-6 flex items-center gap-3">
                  {migrating ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{migrationStatus}</span>
                </div>
            )}

            <button 
              onClick={runFix}
              disabled={migrating || !fixUserId}
              className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Perform Bulk Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
