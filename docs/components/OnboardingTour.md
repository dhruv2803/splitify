# OnboardingTour Component

## Purpose
The `OnboardingTour` provides an interactive, step-by-step guide for new users to familiarize themselves with the application's core features.

## Behavioral Characteristics
-   **Reactive Positioning**: Tooltips use a dynamic boundary-detection system to stay within the viewport. They automatically adjust their coordinates (and arrow position) based on the target's location.
-   **Multi-Tab Awareness**: The tour can switch between application tabs (e.g., from Dashboard to Settings) as the user progresses through steps.
-   **Modal Sensitivity**: Uses a `MutationObserver` to detect when creation modals are opened. If an `altTargetId` is specified for a step, the tour will shift focus to the modal as soon as it appears in the DOM.
-   **Persistence**:
    *   **Database**: Completion status is saved to the `users` collection (`onboardingCompleted: true`).
    *   **localStorage**: Uses `onboarding_seen_[uid]` as a fallback to prevent re-triggering during database sync delays or session refreshes.
    *   **Single-Session Auto-Start**: Uses a React `useRef` to ensure the tour only auto-starts once per session, avoiding race conditions during data updates.

## Tour Steps
1.  **Welcome**: Dashboard overview.
2.  **Categories**: Guidance on organizing spending (targets "New Category" modal).
3.  **Accounts**: Guidance on connecting funding (targets "Create Account" modal).
4.  **Transactions**: Guidance on logging activity (targets "Record Transaction" modal).
5.  **Momentum**: Visualization of spending trends.
6.  **Distribution**: Proportional category breakdown.

## Visual Style
-   **Hole Overlay**: Uses `clip-path` to create a "spotlight" effect on the target element.
-   **Premium Tooltips**: Glassmorphism effects with `backdrop-blur`, bold slate typography, and blue accent highlights.
-   **Smooth Transitions**: Powered by `AnimatePresence` and `motion/react` for entry/exit and position shifting.

## Dependencies
-   `motion/react`: Animations and layout transitions.
-   `lucide-react`: Iconography.
-   `firebase/firestore`: Persistence of completion status.
-   `react-hot-toast`: Feedback on completion.
