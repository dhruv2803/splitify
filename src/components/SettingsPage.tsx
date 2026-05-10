import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthProvider';
import { Category, TransactionType, CURRENCIES } from '../types';
import { cn } from '../lib/utils';
import { Plus, Trash2, X, Tag, ShoppingBag, Coffee, Car, Home, Heart, MoreHorizontal, User, Smartphone, Layout, AlertTriangle, Loader2, Globe, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SettingsPage() {
  const { user, profile, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');

  const handleCurrencyChange = async (currencyCode: string) => {
    if (!user) return;
    setIsUpdatingCurrency(true);
    try {
      await api.put('/profile', { ...profile, currency: currencyCode });
      toast.success(`Default currency set to ${currencyCode}`);
      // Refreshing profile is handled by the AuthProvider if it re-syncs, 
      // but since we updated it, we should probably trigger a re-sync or manually update
      window.location.reload(); // Quick way to re-sync
    } catch (err: any) {
      toast.error('Failed to update currency: ' + err.message);
    } finally {
      setIsUpdatingCurrency(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);



  const handleClearData = async () => {
    if (!user) return;
    setIsClearing(true);
    const toastId = toast.loading('Purging your data...');

    try {
      await api.post('/profile/purge');
      toast.success('All data cleared successfully', { id: toastId });
      setIsDeleteConfirmOpen(false);
      window.location.reload(); // Refresh to clear state
    } catch (err: any) {
      console.error('Purge error:', err);
      toast.error('Failed to clear data: ' + err.message, { id: toastId });
    } finally {
      setIsClearing(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name });
        toast.success('Category updated');
      } else {
        await api.post('/categories', {
          name,
          type,
          icon: 'Tag',
        });
        toast.success('Category added');
      }
      setName('');
      setEditingCategory(null);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category removed');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove category');
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm italic">Manage your profile and custom configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center">
          <div className="relative group mb-6">
            <img 
               src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=3b82f6&color=fff&size=128`} 
               className="h-24 w-24 rounded-full border-4 border-white shadow-xl group-hover:opacity-75 transition-opacity"
               alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm text-white">
                  <User className="h-5 w-5" />
               </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{user?.displayName}</h3>
          <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
          <div className="mt-8 pt-8 border-t border-slate-100 w-full flex flex-col gap-3">
             <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors">
                <Smartphone className="h-4 w-4" />
                Linked Devices
             </button>
             <button 
              onClick={logout}
              className="w-full bg-red-50 text-red-600 py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors"
            >
              Sign Out Securely
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Globe className="h-4 w-4 text-slate-400" />
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Currency</h3>
                </div>
                {isUpdatingCurrency && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
             </div>
             <div className="p-6">
                <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                   Choose your default currency for multi-currency support. All summaries and charts will use this currency for aggregation.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {CURRENCIES.map((curr) => (
                      <button
                         key={curr.code}
                         onClick={() => handleCurrencyChange(curr.code)}
                         disabled={isUpdatingCurrency}
                         className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:bg-slate-50",
                            profile?.currency === curr.code 
                               ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/10 shadow-sm" 
                               : "bg-white border-slate-200"
                         )}
                      >
                         <span className={cn(
                            "text-lg font-black mb-1 transition-transform",
                            profile?.currency === curr.code ? "text-blue-600 scale-110" : "text-slate-400"
                         )}>
                            {curr.symbol}
                         </span>
                         <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            profile?.currency === curr.code ? "text-blue-600" : "text-slate-500"
                         )}>
                            {curr.code}
                         </span>
                      </button>
                   ))}
                </div>
             </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Categories</h3>
                <button 
                  id="btn-add-category"
                  onClick={() => {
                    setEditingCategory(null);
                    setName('');
                    setType('expense');
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-700 transition-colors"
                >
                  + Create
                </button>
             </div>
             
             <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {categories.map((c) => (
                     <div key={c.id} className="group flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-7 h-7 rounded-md flex items-center justify-center",
                             c.type === 'income' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                           )}>
                             <Tag className="h-3.5 w-3.5" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-700">{c.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{c.type}</p>
                           </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(c)} className="text-slate-400 hover:text-blue-600 transition-all scale-90 p-1 hover:bg-blue-50 rounded-md">
                               <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-600 transition-all scale-90 p-1 hover:bg-red-50 rounded-md">
                               <X className="h-4 w-4" />
                            </button>
                         </div>
                     </div>
                   ))}
                   {categories.length === 0 && (
                     <div className="col-span-full py-12 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                        Initializing default system categories...
                     </div>
                   )}
                </div>
             </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                   <Layout className="h-4 w-4" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-900 leading-tight">Data Export</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CSV / PDF JSON</p>
                </div>
             </div>
             <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Download your complete financial history. We prioritize transparency and data portability. Your records are encrypted and ready for export.</p>
             <button className="flex items-center text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline transition-all">
                Generate Full Audit Record &rarr;
             </button>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                   <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-900 leading-tight">Danger Zone</h3>
                   <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Permanent Actions</p>
                </div>
             </div>
             <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Clearing your data will permanently remove all transactions, accounts, and groups. This action cannot be undone. We recommend exporting your data first.</p>
             <button 
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="flex items-center text-red-600 font-bold text-xs uppercase tracking-widest hover:text-red-700 transition-all"
             >
                Reset Account Data &rarr;
             </button>
          </section>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isClearing && setIsDeleteConfirmOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Delete all data?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              This will permanently remove every record in your account. You will start with a fresh blank slate.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={isClearing}
                onClick={handleClearData}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-sm shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isClearing ? 'Purging...' : 'Yes, Delete Everything'}
              </button>
              <button 
                disabled={isClearing}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-full bg-slate-50 text-slate-600 py-3 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
           <div id="modal-add-category" className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Category Name</label>
                <input 
                  required autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Subscriptions, Gifts"
                />
              </div>
              <div className={cn(editingCategory && "opacity-50 pointer-events-none")}>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Transaction Flow {editingCategory && "(Immutable)"}
                </label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    disabled={!!editingCategory}
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                      type === 'expense' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    disabled={!!editingCategory}
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                      type === 'income' ? "bg-white shadow-sm text-green-600" : "text-gray-500"
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all mt-4"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
