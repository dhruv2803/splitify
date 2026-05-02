# TransactionsPage Component

## Purpose
Provides a "Chronicle" or historical ledger of all individual financial activities.

## Behavioral Characteristics
- **Transactional Integrity**: Uses Firestore `runTransaction` to ensure that adding or deleting a transaction atomicity updates the corresponding account's `currentBalance`.
- **Automatic Reconciliation**: 
    - Adding an expense subtracts from the account balance.
    - Adding income adds to the account balance.
    - Deleting a transaction automatically reverts the balance change in the linked account.
- **Data Filtering**: Displays transactions in descending chronological order.
- **Empty State**: 
    - **Configuration Required**: If no accounts or categories exist, displays a warning guiding the user to complete their setup.
    - **Null Sector**: If setup is complete but no transactions exist, displays a placeholder encouraging manual entry.

## Transaction Form
- **Type Toggle**: Large, accessible buttons to switch between `Expense` and `Income`.
- **Dynamic Categories**: The category dropdown filters automatically based on the selected transaction type (e.g., only expense categories are shown for expenses).
- **Defaulting**: Remembers the last used account and date for faster consecutive entries.

## Visual Patterns
- **Velocity Indicators**: Expenses use `ArrowDownLeft` (Slate), Income uses `ArrowUpRight` (Emerald).
- **Premium Ledger**: Each record includes metadata chips (Account name, Date, Category) with high-contrast typography.
- **Hover States**: Transactions reveal a delete button on hover to keep the interface clean.

## State Management
- `transactions`: Main data array.
- `accounts`/`categories`: Used for lookups to display names/icons instead of IDs.
- `transactionCurrency`: Defaults to user's profile currency but can be overridden per record.

## Dependencies
- `firebase/firestore`: Atomic transactions (`runTransaction`).
- `lib/utils`: Currency formatting.
