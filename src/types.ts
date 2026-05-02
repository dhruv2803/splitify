export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency?: string;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
}

export type AccountType = 'wallet' | 'card' | 'bank';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  userId: string;
  color: string;
  icon: string;
  currency?: string;
  createdAt: string;
}

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  userId: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string;
  description: string;
  userId: string;
  currency?: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface Split {
  userId: string;
  amount: number;
  status: 'pending' | 'settled';
}

export interface GroupExpense {
  id: string;
  description: string;
  totalAmount: number;
  paidBy: string; // userId
  groupId: string;
  date: string;
  splits: Split[];
  userId: string;
  currency?: string;
}
