# Project Overview - Splitify

Splitify is a modern, high-performance expense management and bill-splitting application designed for individuals and groups. It provides a premium user experience with a focus on visual excellence, real-time data synchronization, and multi-currency support.

## Core Tech Stack
- **Frontend**: React (with Vite and TypeScript)
- **Styling**: TailwindCSS (for utility-first styling) + Vanilla CSS (for design tokens)
- **Animations**: `motion/react` (Framer Motion)
- **Backend/Database**: Firebase (Authentication, Firestore)
- **Data Visualization**: `recharts`
- **Icons**: `lucide-react`
- **Notifications**: `react-hot-toast`

## Key Features
- **Authentication**: Google SSO integration via Firebase.
- **Dashboard**: Real-time financial overview with charts (expense momentum, category distribution, income vs spending).
- **Account Management**: Support for multiple funding sources (Wallet, Card, Bank) with initial balance setup and real-time balance updates.
- **Transaction Tracking**: Detailed ledger for personal income and expenses, with automatic balance reconciliation.
- **Shared Bills (Groups)**: Create groups, add members, and split expenses equally with real-time settlement tracking.
- **Multi-Currency**: Global currency selection with automatic conversion for dashboards and summaries.
- **Admin Tools**: User management, system stats, and data migration tools for legacy records.
- **Data Privacy**: Feature to permanently clear personal data from the system.

## Application Architecture
- **State Management**: The app uses React Context via `AuthProvider` to manage user sessions and profile data. Most page-level data is managed via Firestore real-time snapshots (`onSnapshot`).
- **Routing**: Client-side routing is handled via a simple state-based `activeTab` system in `App.tsx`, wrapped in `Layout` for consistent navigation.
- **Design System**: A "Premium Minimalist" aesthetic with bold typography (black/900 weights), high-contrast slate colors, and subtle glassmorphism/shadow effects.

## File Structure (Key Directories)
- `/src/components`: UI components and page views.
- `/src/lib`: Firebase configuration, firestore error handling, and shared utilities (currency conversion, formatting).
- `/src/types.ts`: Centralized TypeScript interfaces for all data models.
