# AuthProvider Component

## Purpose
The `AuthProvider` is the central security and state management hub for the application. It wraps the entire app and provides authentication context (user session, profile data) to all child components.

## Behavioral Characteristics
- **Session Persistence**: Uses Firebase `onAuthStateChanged` to track login status.
- **Profile Synchronization**: Automatically listens to the `users` collection in Firestore for the current user's profile.
- **Auto-Provisioning**: On first login (e.g., via Google), it automatically creates a default user profile in Firestore with `INR` as the default currency.
- **Cleanup**: Efficiently unsubscribes from both auth state and profile snapshots when the component unmounts or the user logs out.

## Context API (`useAuth`)
Exposes the following:
- `user`: The raw Firebase `User` object.
- `profile`: The custom `UserProfile` object from Firestore.
- `loading`: Boolean indicating if the initial auth check is in progress.
- `signIn`: Function to trigger Google Pop-up authentication.
- `logout`: Function to sign out the user and clean up listeners.

## Key Dependencies
- `firebase/auth`: Core authentication logic.
- `firebase/firestore`: Profile data storage.
- `../lib/firestore-errors`: Shared error handling for database operations.
