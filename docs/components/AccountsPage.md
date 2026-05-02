# AccountsPage Component

## Purpose
Manages the user's "Funding Sources" or "Liquid Assets". This is where users define their wallets, bank accounts, and credit cards.

## Behavioral Characteristics
- **Account Types**:
    - `wallet`: Cash or digital wallets (Standard Asset).
    - `bank`: Savings or checking accounts (Standard Asset).
    - `card`: Credit cards (Liability). Initial balances for cards are automatically treated as negative values (outstanding debt).
- **CRUD Operations**:
    - **Create/Edit**: Modal-based form with real-time feedback. Users can select custom theme colors.
    - **Delete**: Removes the account record. Note: Associated transactions currently remain in the system (orphaned) to preserve history.
- **Visual Feedback**:
    - Cards change color based on the selected "Theme Color".
    - Accounts with negative balances (debts or overdrawn) display numerical values in `red-500`.
    - Includes a status indicator (`Healthy` vs `Restricted`) based on the balance.

## State Management
- `accounts`: Real-time snapshot of the user's accounts.
- `isModalOpen`: Controls the creation/editing dialog.
- `editingAccount`: Stores the account object being modified (null for new accounts).

## Form Features
- **Initial Balance**: Can only be set during creation.
- **Currency Selection**: Allows accounts to have a different native currency than the global default.
- **Color Picker**: A curated set of high-saturation colors for easy identification.

## Dependencies
- `firebase/firestore`: Data persistence.
- `react-hot-toast`: Operation status feedback.
- `lucide-react`: Account type icons.
