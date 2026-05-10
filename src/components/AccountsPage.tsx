import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthProvider';
import { Account, AccountType, CURRENCIES } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { Plus, Wallet, CreditCard, Landmark, X, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AccountsPage() {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const currency = profile?.currency || 'INR';
  const format = (amt: number) => formatCurrency(amt, currency);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('wallet');
  const [initialBalance, setInitialBalance] = useState('0');
  const [color, setColor] = useState('bg-blue-600');
  const [accountCurrency, setAccountCurrency] = useState(profile?.currency || 'INR');

  useEffect(() => {
    if (profile?.currency && !accountCurrency) {
      setAccountCurrency(profile.currency);
    }
  }, [profile]);

  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 
    'bg-sky-600', 'bg-violet-600', 'bg-slate-800', 'bg-fuchsia-600'
  ];

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts();
      // Ensure IDs are strings for consistency in the frontend
      const formatted = (data || []).map((acc: any) => ({ ...acc, id: acc.id.toString() }));
      setAccounts(formatted);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const balanceNum = parseFloat(initialBalance);
      // For credit cards, treatment as outstanding balance (debt)
      const adjustedBalance = type === 'card' ? -Math.abs(balanceNum) : balanceNum;

      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          name, 
          type, 
          color,
          currency: accountCurrency,
          initialBalance: editingAccount.initialBalance // Backend enforces this anyway
        });
        toast.success('Account updated');
      } else {
        await api.createAccount({
          name,
          type,
          initialBalance: adjustedBalance,
          currentBalance: adjustedBalance,
          color,
          currency: accountCurrency,
        });
        toast.success('Account created');
      }
      fetchAccounts();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save account');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setName('');
    setType('wallet');
    setInitialBalance('0');
    setColor('bg-indigo-500');
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setInitialBalance(account.initialBalance.toString());
    setColor(account.color);
    setAccountCurrency(account.currency || profile?.currency || 'INR');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Only empty accounts can be deleted.')) return;
    try {
      await api.deleteAccount(id);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  const getIcon = (t: string) => {
    switch (t) {
      case 'wallet': return Wallet;
      case 'card': return CreditCard;
      case 'bank': return Landmark;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Liquid State</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your funding sources and assets</p>
        </div>
        <button 
          id="btn-add-account"
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
        >
          + Initialize account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const Icon = getIcon(account.type);
          return (
            <div key={account.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group relative overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
               <div className="absolute top-0 right-0 p-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEditModal(account)} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-xl border border-slate-100 shadow-sm transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(account.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-xl border border-slate-100 shadow-sm transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              <div className="flex items-center gap-4 mb-8">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", account.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{account.type}</p>
                   <h3 className="text-sm font-black text-slate-900 truncate tracking-tight">{account.name}</h3>
                </div>
              </div>

              <div>
                <p className={cn(
                  "text-3xl font-black tracking-tighter leading-none mb-1",
                  account.currentBalance < 0 ? "text-red-500" : "text-slate-900"
                )}>
                  {formatCurrency(account.currentBalance, account.currency || currency)}
                </p>
                <div className="mt-6">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {account.currentBalance < 0 ? 'LIABILITY' : 'ASSET'}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                        account.currentBalance < 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                       )}>
                        {account.currentBalance < 0 ? 'Restricted' : 'Healthy'}
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", account.currentBalance < 0 ? "bg-red-500" : "bg-emerald-500")} style={{ width: '65%' }}></div>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div id="modal-add-account" className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {editingAccount ? 'Edit Account' : 'Create Account'}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                <input 
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="e.g. Personal Wallet, Chase Card"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['wallet', 'card', 'bank'] as AccountType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all capitalize",
                      type === t ? "border-blue-600 bg-blue-50 text-blue-600" : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {t === 'wallet' && <Wallet className="h-4 w-4 mb-1" />}
                    {t === 'card' && <CreditCard className="h-4 w-4 mb-1" />}
                    {t === 'bank' && <Landmark className="h-4 w-4 mb-1" />}
                    <span className="text-[10px] font-bold">{t}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      {type === 'card' ? 'Initial Outstanding' : 'Initial Balance'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xl font-mono">
                        {CURRENCIES.find(c => c.code === accountCurrency)?.symbol || '$'}
                      </span>
                      <input 
                        required
                        disabled={!!editingAccount}
                        type="number"
                        step="0.01"
                        value={initialBalance}
                        onChange={e => setInitialBalance(e.target.value)}
                        className={cn(
                          "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 font-bold focus:outline-none focus:ring-2 transition-all text-xl font-mono disabled:opacity-50",
                          type === 'card' ? "focus:ring-red-500/20" : "focus:ring-blue-500/20"
                        )}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Curr</label>
                    <select 
                      value={accountCurrency}
                      onChange={e => setAccountCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                </div>
                {type === 'card' && !editingAccount && (
                  <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter bg-red-50 p-2 rounded border border-red-100 italic">
                    Note: This is treated as debt and will reduce your net worth.
                  </p>
                )}
                {type !== 'card' && !editingAccount && (
                  <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
                    Starting amount available in this account.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Theme Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all shrink-0",
                        c,
                        color === c ? "border-white ring-2 ring-blue-500 scale-125" : "border-transparent hover:scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all mt-4"
              >
                {editingAccount ? 'Save Changes' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
