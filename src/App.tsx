/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AccountsPage } from './components/AccountsPage';
import { TransactionsPage } from './components/TransactionsPage';
import { GroupsPage } from './components/GroupsPage';
import { SettingsPage } from './components/SettingsPage';
import { AdminPage } from './components/AdminPage';
import { LandingPage } from './components/LandingPage';
import { OnboardingTour } from './components/OnboardingTour';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (profile && profile.onboardingCompleted === undefined) {
      // Auto start for brand new users
      const timer = setTimeout(() => setIsTourOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile]);
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'groups':
        return <GroupsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return profile?.isAdmin ? <AdminPage /> : <Dashboard setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onStartTour={() => setIsTourOpen(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-20 md:pb-0"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <OnboardingTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <AppContent />
    </AuthProvider>
  );
}
