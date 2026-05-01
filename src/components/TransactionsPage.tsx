import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, runTransaction, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { Transaction, Account, Category, TransactionType } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { Plus, Minus, X, Calendar, ArrowUpRight, ArrowDownLeft, Trash2, Filter, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return;

    const qT = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
    const unsubT = onSnapshot(qT, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const qA = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const unsubA = onSnapshot(qA, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAccounts(data);
      if (data.length > 0 && !accountId) setAccountId(data[0].id);
    });

    const qC = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const unsubC = onSnapshot(qC, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
    });

    return () => {
      unsubT();
      unsubA();
      unsubC();
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountId || !categoryId) {
      toast.error('Please fill all fields and ensure you have an account');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      await runTransaction(db, async (tx) => {
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await tx.get(accountRef);
        
        if (!accountDoc.exists()) throw new Error("Account does not exist!");

        const currentBalance = accountDoc.data().currentBalance;
        const newBalance = type === 'income' 
          ? currentBalance + amountNum 
          : currentBalance - amountNum;

        // Create transaction
        const transRef = doc(collection(db, 'transactions'));
        tx.set(transRef, {
          amount: amountNum,
          type,
          categoryId,
          accountId,
          date,
          description,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });

        // Update balance
        tx.update(accountRef, { currentBalance: newBalance });
      });

      toast.success('Transaction added');
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add transaction');
    }
  };

  const handleDelete = async (t: Transaction) => {
    if (!confirm('Delete this transaction? The account balance will be reverted.')) return;
    try {
      await runTransaction(db, async (tx) => {
        const accountRef = doc(db, 'accounts', t.accountId);
        const accountDoc = await tx.get(accountRef);
        
        // Even if account doc is missing, we delete transaction
        if (accountDoc.exists()) {
          const currentBalance = accountDoc.data().currentBalance;
          const revertedBalance = t.type === 'income' 
            ? currentBalance - t.amount 
            : currentBalance + t.amount;
          tx.update(accountRef, { currentBalance: revertedBalance });
        }
        
        tx.delete(doc(db, 'transactions', t.id));
      });
      toast.success('Transaction deleted');
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setDescription('');
    // Keep type/account/date for convenience
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Chronicle</h2>
          <p className="text-slate-500 text-sm font-medium">Your historical financial velocity</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
        >
          + Add record
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Live Ledger</h3>
            <div className="flex gap-2">
               <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm"><Filter className="h-4 w-4"/></button>
            </div>
        </div>

        {transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
               <Receipt className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Null Sector</p>
            <p className="text-slate-400 font-medium italic text-sm max-w-xs">No activity has been piped into the ledger for this window.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-8 bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all">Manual Entry &rarr;</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transactions.map((t) => {
              const acc = accounts.find(a => a.id === t.accountId);
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="p-4 md:p-6 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mr-5 shrink-0 transition-all group-hover:scale-110 shadow-sm border border-white",
                    t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  )}>
                     {t.type === 'income' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight mb-1">{t.description || (t.type === 'income' ? 'Income Stream' : 'Capital Expenditure')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">{acc?.name || 'Unknown Hub'}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter opacity-60">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {cat && <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{cat.name}</span>}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6 ml-4">
                    <div className="shrink-0">
                      <span className={cn(
                        "text-base md:text-xl font-black tracking-tighter block leading-none mb-1",
                        t.type === 'income' ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">Verified</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(t)}
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-xl border border-slate-100 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Record Transaction</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setType('expense')}
                className={cn(
                  "flex-1 py-2 rounded-lg font-bold text-xs transition-all tracking-wider uppercase",
                  type === 'expense' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
                )}
              >
                Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={cn(
                  "flex-1 py-2 rounded-lg font-bold text-xs transition-all tracking-wider uppercase",
                  type === 'income' ? "bg-white shadow-sm text-green-600" : "text-slate-500"
                )}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xl">$</span>
                  <input 
                    autoFocus
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-8 text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Account</label>
                  <select 
                    required
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" disabled>Select</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select 
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" disabled>Select</option>
                    {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <input 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                <input 
                  required
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all mt-4"
              >
                Log {type === 'expense' ? 'Expense' : 'Income'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
