# Project Overview - Splitify

Splitify is a modern, high-performance expense management and bill-splitting application designed for individuals and groups. It provides a premium user experience with a focus on visual excellence, real-time data synchronization, and multi-currency support.

## Core Tech Stack
- **Frontend**: React (with Vite and TypeScript)
- **Styling**: TailwindCSS (for utility-first styling) + Vanilla CSS (for design tokens)
- **Environment Config**: Vite `.env` system (Separated Local/Production databases)
- **CI/CD**: GitHub Actions -> GCP Cloud Run (Multi-stage Docker build)
- **Animations**: `motion/react` (Framer Motion)
- **Backend**: Go (Gin Framework)
- **Database**: SQLite (managed via GORM)
- **Authentication**: Native Google SSO (ID Token verification)
- **API Architecture**: OpenAPI 3.0 with auto-generated TypeScript clients
- **Data Visualization**: `recharts`
- **Animations**: `motion/react` (Framer Motion)
- **Icons**: `lucide-react`
- **Notifications**: `react-hot-toast`

## Key Features
- **Authentication**: Native Google SSO integration with secure JWT verification on the backend.
- **Dashboard**: High-performance financial overview with charts (expense momentum, category distribution, income vs spending).
- **Account Management**: Support for multiple funding sources (Wallet, Card, Bank) with initial balance setup and atomic balance updates.
- **Transaction Tracking**: Detailed ledger for personal income and expenses, with automatic balance reconciliation using GORM transactions.
- **Shared Bills (Groups)**: (In Development) Support for group settlements and expense splitting.
- **Multi-Currency**: Global currency selection with localized formatting for dashboards and summaries.
- **Admin Tools**: Comprehensive dashboard for system stats, user role management, and database integrity checks.
- **Data Privacy**: Feature to permanently clear personal data from the system with database-level cascading deletes.
- **Interactive Onboarding**: Guided tour for new users with persistent progress tracking on the server.

## Application Architecture
- **State Management**: The app uses React Context via `AuthProvider` to manage user sessions and profile data. 
- **API Layer**: All communication with the backend is handled via a generated TypeScript client in `src/lib/api-generated.ts`, ensuring strict type safety between frontend and backend.
- **Routing**: Client-side routing is handled via a state-based `activeTab` system in `App.tsx`, providing a seamless SPA experience.
- **Design System**: A "Premium Minimalist" aesthetic with bold typography, high-contrast slate colors, and smooth micro-animations.

## File Structure (Key Directories)
- `/backend`: Go source code, database migrations, and OpenAPI specification.
- `/src/components`: UI components and page views.
- `/src/lib`: API wrappers, theme utilities, and auth context.
- `/src/types.ts`: Centralized TypeScript interfaces (synced with Go models).
