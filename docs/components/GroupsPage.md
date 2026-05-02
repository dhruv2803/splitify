# GroupsPage Component

## Purpose
Facilitates collaborative bill-splitting ("Shared Bills") between multiple users.

## Behavioral Characteristics
- **Multi-Member Architecture**: Groups are defined by a `members` array of UIDs.
- **Equal Splitting**: Expenses added to a group are automatically divided equally among all members.
- **Settlement Tracking**: Calculates real-time balances for the current user vs other members.
    - `+Amount`: Other members owe you.
    - `-Amount`: You owe other members.
- **Hierarchical View**:
    - **List View**: Overview of all joined groups.
    - **Detail View**: Specific group history, total spend summary, and individual settlement status.

## Expense Logging
- **Split Logic**: When a `GroupExpense` is created, it generates a `splits` array where each member is assigned their share. 
- **Payer Status**: The creator of the expense is marked as `settled` for their own share, while others are marked as `pending`.

## Visual Design
- **Collaborative Aesthetic**: Uses `Users` and `UsersPlus` icons to emphasize social interaction.
- **Interaction**: Uses `motion/react` for smooth "slide-in" transitions when opening a specific group.
- **Summary Cards**: Displays "Total Group Spend" prominently to provide shared context.

## State Management
- `groups`: List of groups where the user is a member.
- `selectedGroup`: The group currently being viewed in detail.
- `expenses`: Group-specific expense records.

## Known Limitations / Future Work
- **Member Addition**: Current implementation allows group creation; adding members via email lookup is planned (currently uses a single-member default for demo purposes).
- **Settlement Logic**: Basic "who owes who" logic is implemented; a formal "Settle Up" transaction feature is the next logical addition.

## Dependencies
- `firebase/firestore`: Complex queries (`array-contains`).
- `lib/utils`: Formatting.
