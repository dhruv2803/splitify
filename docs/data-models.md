# Data Models - Splitify

Splitify uses **SQLite** (managed via GORM) as its primary data store. The following models define the relational schema in the `splitify.db` file.

## Relational Schema

### `users` table
Stores user profile information and administrative roles.
- **Primary Key**: `uid` (string from Google SSO)
- **Fields**:
  - `email`: string
  - `display_name`: string
  - `photo_url`: string
  - `currency`: string (Default: 'INR')
  - `is_admin`: boolean (Default: false)
  - `onboarding_completed`: boolean (Default: false)
  - `created_at`: datetime
  - `updated_at`: datetime

### `accounts` table
Stores individual funding sources.
- **Primary Key**: `id` (Auto-incrementing Integer)
- **Fields**:
  - `name`: string
  - `type`: 'wallet' | 'card' | 'bank'
  - `initial_balance`: float64
  - `current_balance`: float64 (Updated atomically via backend transactions)
  - `user_id`: string (Foreign Key to users.uid)
  - `color`: string
  - `icon`: string
  - `currency`: string

### `transactions` table
Ledger for all income and expense records.
- **Primary Key**: `id` (Auto-incrementing Integer)
- **Fields**:
  - `amount`: float64
  - `type`: 'expense' | 'income'
  - `category_id`: uint (Foreign Key to categories.id)
  - `account_id`: uint (Foreign Key to accounts.id)
  - `date`: datetime
  - `description`: string
  - `currency`: string
  - `user_id`: string (Foreign Key to users.uid)

### `categories` table
Organization categories for transactions.
- **Primary Key**: `id` (Auto-incrementing Integer)
- **Fields**:
  - `name`: string
  - `type`: 'expense' | 'income'
  - `icon`: string
  - `user_id`: string (Foreign Key to users.uid)
  - `is_default`: boolean

### `groups` table
Shared bill-splitting groups.
- **Primary Key**: `id` (Auto-incrementing Integer)
- **Fields**:
  - `name`: string
  - `owner_id`: string (Foreign Key to users.uid)
  - `members`: (Many-to-many relationship via `group_members` join table)

### `group_expenses` table
Expenses logged within a specific group.
- **Primary Key**: `id` (Auto-incrementing Integer)
- **Fields**:
  - `description`: string
  - `total_amount`: float64
  - `paid_by`: string (Foreign Key to users.uid)
  - `group_id`: uint (Foreign Key to groups.id)
  - `date`: datetime
  - `currency`: string

### `group_expense_splits` table
Individual shares of a group expense.
- **Fields**:
  - `group_expense_id`: uint
  - `user_id`: string
  - `amount`: float64
  - `status`: 'pending' | 'settled'

## Database Integrity & Transitions
- **Atomic Balance Updates**: When a transaction is created, updated, or deleted, the backend uses a GORM `Transaction` block to ensure the corresponding `Account.current_balance` is recalculated accurately.
- **Cascading Deletes**: User profile purging uses database-level logic to remove all associated categories, accounts, and transactions.

## Enums and Constants
- `CURRENCIES`: Supported currency list with codes, names, and symbols (USD, EUR, GBP, JPY, INR, CAD, AUD, BRL).
- `EXCHANGE_RATES`: Hardcoded rates used for dashboard conversions (base: USD).
