# LandingPage Component

## Purpose
The public-facing entry point for unauthenticated visitors. Its goal is to convert visitors into users via an optimized marketing-style layout.

## Behavioral Characteristics
- **Glassmorphism Header**: Uses a sticky, translucent header (`backdrop-blur-md`) for a modern feel.
- **Visual Engagement**: 
    - Employs abstract background decorations (large blurred blue circles).
    - Features a "Hero" section with bold, overlapping typography.
    - Includes social proof via a "2,000+ Active Users" avatar stack.
- **Conversion focused**: Multiple "Get Started" and "Sign In" buttons triggering the Google Auth flow.

## Key Sections
- **Hero**: Catchy headline ("Finance for Connected Living") and clear value proposition.
- **Feature Grid**: highlights three core pillars:
    - Smart Splitting (Groups)
    - Multi-Account Support (Wallets/Cards)
    - Real-time Trends (Dashboard)
- **Footer**: Simplified navigation and legal placeholders.

## Design Patterns
- **Animations**: Uses Framer Motion for gentle entry animations (`y: 20` to `y: 0`).
- **Cards**: Feature cards use `shadow-soft` and scale slightly on hover.
- **Typography**: Uses the `black` (900) font weight for headlines to maintain the project's distinctive "premium" look.

## Dependencies
- `motion/react`: Entry animations.
- `lucide-react`: Feature icons.
- `AuthProvider`: Triggering the `signIn` function.
