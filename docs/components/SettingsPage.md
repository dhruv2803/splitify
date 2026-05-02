# SettingsPage Component

## Purpose
The "Configuration" hub for user-specific preferences and data management.

## Behavioral Characteristics
- **Profile Overview**: Displays user name, email, and avatar fallback.
- **Global Currency Selection**: Allows users to set their default display currency. Updating this triggers a write to the `users` collection.
- **Category Management**: 
    - Users can add custom categories for Income or Expenses.
    - **Self-Healing**: If a user has no categories, the system automatically "seeds" a set of defaults (Food, Shopping, Salary, etc.).
- **Data Portability**: Placeholder UI for CSV/PDF exports.
- **Privacy Controls (Danger Zone)**: Includes a "Reset Account Data" feature that recursively purges all user-associated documents across 5 collections (`groupExpenses`, `groups`, `transactions`, `accounts`, `categories`).

## Data Purge Logic
- Uses `writeBatch` to delete documents in chunks of 500 (Firestore limit).
- Includes detailed error logging for debugging purge failures.
- Prevents UI interaction during the "Purging" state to avoid data corruption.

## Visual Style
- Uses `rounded-xl` and `bg-slate-50` for a clean, modular layout.
- The "Danger Zone" is highlighted with `red-100` borders and `AlertTriangle` icons.
- Interactive settings (like Currency) use a grid of high-contrast toggle cards.

## Dependencies
- `firebase/firestore`: Multi-collection batch writes.
- `react-hot-toast`: Progress indicators for data clearing.
- `lucide-react`: Settings iconography.
