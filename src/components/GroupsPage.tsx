import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { Group, GroupExpense, Split, UserProfile } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { Plus, Users, X, MoreVertical, CreditCard, ChevronRight, UserPlus, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);

  // Form State - Group
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Form State - Expense
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    return onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    });
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(collection(db, 'groupExpenses'), where('groupId', '==', selectedGroup.id), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupExpense)));
    });
  }, [selectedGroup]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName) return;

    try {
      // In a real app, we'd lookup user UIDs from emails.
      // For this demo, let's just assume the user is the only member for now or add their email as placeholder.
      // We'll just add the current user's UID to the members.
      await addDoc(collection(db, 'groups'), {
        name: groupName,
        ownerId: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
      });
      toast.success('Group created');
      setGroupName('');
      setIsNewGroupModalOpen(false);
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !expenseAmount) return;

    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      const splitAmount = amountNum / selectedGroup.members.length;
      const splits: Split[] = selectedGroup.members.map(mUid => ({
        userId: mUid,
        amount: splitAmount,
        status: mUid === user.uid ? 'settled' : 'pending'
      }));

      await addDoc(collection(db, 'groupExpenses'), {
        description: expenseDescription,
        totalAmount: amountNum,
        paidBy: user.uid,
        groupId: selectedGroup.id,
        date: new Date().toISOString(),
        splits,
        userId: user.uid, // recorded for rules
      });

      toast.success('Expense added to group');
      setExpenseAmount('');
      setExpenseDescription('');
      setIsNewExpenseModalOpen(false);
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const calculateBalances = () => {
    if (!selectedGroup || !user) return [];
    
    // Simple balance calculation: Who owes me vs who do I owe
    const balances: Record<string, number> = {};
    selectedGroup.members.forEach(uid => { if(uid !== user.uid) balances[uid] = 0; });

    expenses.forEach(exp => {
      if (exp.paidBy === user.uid) {
        // I paid, others owe me
        exp.splits.forEach(split => {
          if (split.userId !== user.uid) {
            balances[split.userId] += split.amount;
          }
        });
      } else {
        // Someone else paid, look for my split
        const mySplit = exp.splits.find(s => s.userId === user.uid);
        if (mySplit) {
          balances[exp.paidBy] -= mySplit.amount;
        }
      }
    });

    return Object.entries(balances).map(([uid, balance]) => ({ uid, balance }));
  };

  if (selectedGroup) {
    const balances = calculateBalances();
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center mb-8 gap-4 px-1">
          <button onClick={() => setSelectedGroup(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedGroup.name}</h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{selectedGroup.members.length} Members</p>
          </div>
          <button 
            onClick={() => setIsNewExpenseModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors"
          >
            + New Bill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
             <div className="absolute top-0 right-0 -tr-4 -tt-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl"></div>
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Group Spend</h3>
             <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {formatCurrency(expenses.reduce((acc, curr) => acc + curr.totalAmount, 0))}
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                <Users className="h-3 w-3" />
                SPLIT BETWEEN {selectedGroup.members.length} MEMBERS
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Settlement Overview</h3>
             <div className="space-y-3">
                {balances.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No other members</p>
                ) : (
                  balances.map((b) => (
                    <div key={b.uid} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                           <Users className="h-3 w-3 text-slate-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{b.uid.slice(0, 8)}...</span>
                      </div>
                      <span className={cn(
                        "text-xs font-bold",
                        b.balance > 0 ? "text-green-600" : b.balance < 0 ? "text-red-500" : "text-slate-400"
                      )}>
                        {b.balance > 0 ? `+${formatCurrency(b.balance)}` : b.balance < 0 ? `-${formatCurrency(Math.abs(b.balance))}` : '0.00'}
                      </span>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="font-bold text-slate-900 tracking-tight">Bill History</h3>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{expenses.length} Records</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">No bills logged yet</div>
            ) : (
              expenses.map(e => (
                <div key={e.id} className="p-4 flex items-center hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{e.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Paid by {e.paidBy === user?.uid ? 'You' : 'Member'} • {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(e.totalAmount)}</p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">Your share: {formatCurrency(e.totalAmount / (selectedGroup.members.length || 1))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Expense Modal */}
        {isNewExpenseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNewExpenseModalOpen(false)} />
            <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">Post Group Bill</h3>
                 <button onClick={() => setIsNewExpenseModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                 </button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Expense Description</label>
                  <input 
                    required autoFocus
                    value={expenseDescription}
                    onChange={e => setExpenseDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Dinner, AirBnB Fees"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xl">$</span>
                    <input 
                      required type="number" step="0.01"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 ml-1 font-medium bg-slate-50 p-2 rounded border border-slate-100">
                    Will be split equally between {selectedGroup.members.length} members ({formatCurrency((parseFloat(expenseAmount) || 0) / selectedGroup.members.length)} each).
                  </p>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4"
                >
                  Log Group Bill
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shared Bills</h2>
          <p className="text-slate-500 text-sm">Split expenses with friends</p>
        </div>
        <button 
          onClick={() => setIsNewGroupModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors"
        >
          + Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.length === 0 ? (
          <button 
            onClick={() => setIsNewGroupModalOpen(true)}
            className="md:col-span-2 bg-white rounded-xl border-2 border-dashed border-slate-100 p-12 text-center group hover:bg-slate-50 transition-colors"
          >
            <Users className="h-12 w-12 text-slate-200 mx-auto mb-4 group-hover:text-blue-300 transition-colors" />
            <p className="text-slate-400 font-bold text-sm tracking-tight mb-2">No split groups found</p>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Start a new group &rarr;</span>
          </button>
        ) : (
          groups.map(g => (
            <div 
              key={g.id} 
              onClick={() => setSelectedGroup(g)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between cursor-pointer group hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                   <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{g.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.members.length} Members</p>
                </div>
                <ChevronRight className="ml-auto text-slate-300 h-5 w-5 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-50">
                 <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Your Status</p>
                    <p className="text-xs font-bold text-green-600">Settled</p>
                 </div>
                 <div className="flex-1 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Activity</p>
                    <p className="text-xs font-bold text-slate-500 italic">2 pending bills</p>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNewGroupModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Group</h3>
               <button onClick={() => setIsNewGroupModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
               </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Group Name</label>
                <input 
                  required autoFocus
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Europe Trip 2026, Flatmates"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4"
              >
                Launch Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
