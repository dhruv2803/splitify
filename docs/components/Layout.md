# Layout Component

## Purpose
The `Layout` component provides the persistent structural shell of the application, including the sidebar (Desktop) and bottom navigation (Mobile).

## Behavioral Characteristics
- **Responsive Design**: 
    - **Desktop**: A fixed 64px sidebar with high-contrast text and a user profile footer.
    - **Mobile**: A sticky bottom navigation bar with icons and small labels.
- **Dynamic Navigation**: Menu items are dynamically generated. If the user has `isAdmin: true` in their profile, an additional "Admin" tab is automatically added to the menu.
- **State Integration**: Receives `activeTab` and `setActiveTab` as props to highlight the current location and trigger view changes.
- **Visual Style**:
    - Uses `slate-50` for the main background to contrast with white content cards.
    - Employs `lucide-react` for clean, consistent iconography.
    - Profile section includes an auto-generated avatar fallback using `ui-avatars.com`.

## Layout Structure
- **Sidebar**: Logo section -> Navigation links -> User profile & Logout.
- **Main Area**: Scrollable container with a max-width of `5xl` and responsive padding.
- **Mobile Nav**: Fixed bottom bar with centered icon buttons.

## Dependencies
- `lucide-react`: Navigation icons.
- `framer-motion`: Smooth layout transitions.
- `AuthProvider`: Access to user profile for admin checks and logout.
