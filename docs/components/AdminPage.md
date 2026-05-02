# AdminPage Component

## Purpose
A restricted control center for system administrators to monitor health and manage the user base.

## Behavioral Characteristics
- **Access Control**: Automatically checks `profile.isAdmin`. Non-admin users are redirected or shown an "Access Denied" view.
- **System Monitoring**: Aggregates total counts for Users, Accounts, Transactions, and Group Expenses across the entire database.
- **User Management**:
    - Displays a searchable table of all registered users.
    - Allows promoting or demoting users to/from the `Admin` role.
    - **Self-Protection**: Prevents admins from removing their own admin status.
- **System Tools (Migration & Fixes)**:
    - **Legacy Migration**: A script to patch older documents that are missing the `currency` field by looking up the owner's default preference.
    - **Bulk Swap (Currency Swap)**: A targeted tool to change all records of a specific currency to another for a single user (e.g., fixing an accidental entry in the wrong currency).

## Technical Implementation
- **Batch Processing**: Uses Firestore `writeBatch` for system-wide migrations to ensure performance and cost-efficiency.
- **Data Loading**: Fetches data from multiple collections in parallel using `Promise.all`.
- **Sub-Tabs**: Uses a local `activeSubTab` state to switch between `Overview`, `Users`, and `Tools`.

## Visual Tokens
- **Admin Branding**: Uses `Shield` icons and `blue-600` accents to signify high-level authority.
- **Monospaced IDs**: Displays raw UIDs in `font-mono` for technical precision.
- **Status Badges**: Uses rounded pill badges for "Admin" (Blue) and "Regular User" (Slate).

## Dependencies
- `firebase/firestore`: Global collection fetches and write batches.
- `lib/utils`: Styling helpers.
