# Data Models - Splitify

Splitify uses Firestore as its primary data store. The following TypeScript interfaces define the structure of the documents in each collection.

## Firestore Collections

### `users`
Stores user profile information and global settings.
- **Path**: `users/{uid}`
- **Interface**: `UserProfile`
```typescript
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency?: string; // Default currency for aggregation (e.g., 'INR', 'USD')
  isAdmin?: boolean; // Admin privilege flag
  createdAt: string; // ISO string or serverTimestamp
}
```

### `accounts`
Stores individual funding sources (wallets, bank accounts, cards).
- **Path**: `accounts/{accountId}`
- **Interface**: `Account`
```typescript
interface Account {
  id: string;
  name: string;
  type: 'wallet' | 'card' | 'bank';
  initialBalance: number;
  currentBalance: number; // Updated automatically on transactions
  userId: string;
  color: string; // Tailwind bg class (e.g., 'bg-blue-600')
  icon: string;
  currency?: string; // Account-specific currency
  createdAt: string;
}
```

### `transactions`
Personal (non-group) income and expense records.
- **Path**: `transactions/{transactionId}`
- **Interface**: `Transaction`
```typescript
interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  description: string;
  userId: string;
  currency?: string;
  groupId?: string; // Optional: Link to a group if split
}
```

### `categories`
Customizable categories for organizing transactions.
- **Path**: `categories/{categoryId}`
- **Interface**: `Category`
```typescript
interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  userId: string;
  isDefault?: boolean; // System-seeded defaults
}
```

### `groups`
Shared bill-splitting groups.
- **Path**: `groups/{groupId}`
- **Interface**: `Group`
```typescript
interface Group {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // Array of UIDs
  createdAt: string;
}
```

### `groupExpenses`
Expenses logged within a specific group.
- **Path**: `groupExpenses/{expenseId}`
- **Interface**: `GroupExpense`
```typescript
interface GroupExpense {
  id: string;
  description: string;
  totalAmount: number;
  paidBy: string; // userId of the payer
  groupId: string;
  date: string;
  splits: Split[];
  userId: string; // duplicate of paidBy or creator for security rules
  currency?: string;
}

interface Split {
  userId: string;
  amount: number;
  status: 'pending' | 'settled';
}
```

## Enums and Constants
- `CURRENCIES`: Supported currency list with codes, names, and symbols (USD, EUR, GBP, JPY, INR, CAD, AUD, BRL).
- `EXCHANGE_RATES`: Hardcoded rates used for dashboard conversions (base: USD).
