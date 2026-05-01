export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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
}
