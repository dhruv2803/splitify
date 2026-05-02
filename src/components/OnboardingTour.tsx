import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X, ChevronRight, ChevronLeft, Sparkles, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  targetId: string;
  title: string;
  content: string;
  tab?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Step[] = [
  {
    targetId: 'nav-dashboard',
    title: 'Welcome to Splitify!',
    content: 'Let\'s get you started with a quick tour of your new financial command center.',
    tab: 'dashboard',
    position: 'right'
  },
  {
    targetId: 'btn-add-category',
    title: 'Organize your spending',
    content: 'First, set up custom categories for your income and expenses to keep your data clean.',
    tab: 'settings',
    position: 'left'
  },
  {
    targetId: 'btn-add-account',
    title: 'Connect your funding',
    content: 'Add your wallets, bank accounts, or credit cards to track your liquid assets in real-time.',
    tab: 'accounts',
    position: 'left'
  },
  {
    targetId: 'btn-add-transaction',
    title: 'Log your activity',
    content: 'Record daily expenses or income. Your account balances will reconcile automatically.',
    tab: 'transactions',
    position: 'left'
  },
  {
    targetId: 'chart-momentum',
    title: 'Track your momentum',
    content: 'Visualize your 14-day spending velocity to identify trends quickly.',
    tab: 'dashboard',
    position: 'top'
  },
  {
    targetId: 'chart-categories',
    title: 'Expense Distribution',
    content: 'See exactly where your money goes with our proportional category breakdown.',
    tab: 'dashboard',
    position: 'top'
  }
];

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({ activeTab, setActiveTab, isOpen, onClose }: OnboardingTourProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    
    // Switch tab if needed
    if (step.tab && step.tab !== activeTab) {
      setActiveTab(step.tab);
      // Wait for tab transition before calculating position
      setIsReady(false);
      const timer = setTimeout(() => updatePosition(), 400);
      return () => clearTimeout(timer);
    } else {
      updatePosition();
    }
  }, [currentStep, activeTab, isOpen]);

  const updatePosition = () => {
    const step = TOUR_STEPS[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      setIsReady(true);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If element not found (e.g. tab not switched yet), retry once
      setTimeout(() => {
        const retryEl = document.getElementById(step.targetId);
        if (retryEl) {
          const rect = retryEl.getBoundingClientRect();
          setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
          setIsReady(true);
        }
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true
        });
      } catch (err) {
        console.error("Failed to update onboarding status", err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dimmed Overlay with Hole */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all duration-500" style={{
        clipPath: isReady ? `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)` : 'none'
      }} />

      <AnimatePresence mode="wait">
        {isReady && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute pointer-events-auto z-[210] w-full max-w-sm"
            style={{
              top: step.position === 'top' ? coords.top - 20 : (step.position === 'bottom' ? coords.top + coords.height + 20 : coords.top + coords.height / 2),
              left: step.position === 'left' ? coords.left - 20 : (step.position === 'right' ? coords.left + coords.width + 20 : coords.left + coords.width / 2),
              transform: step.position === 'top' ? 'translate(-50%, -100%)' : (step.position === 'bottom' ? 'translate(-50%, 0)' : (step.position === 'left' ? 'translate(-100%, -50%)' : 'translate(0, -50%)'))
            }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-blue-100 ring-8 ring-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                      <Sparkles className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                </div>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2">{step.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{step.content}</p>

              <div className="flex items-center justify-between">
                <button 
                  onClick={onClose}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip Tour
                </button>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button 
                      onClick={handleBack}
                      className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className={cn(
              "absolute w-4 h-4 bg-white rotate-45 border border-blue-100/50",
              step.position === 'top' && "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
              step.position === 'bottom' && "top-[-8px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
              step.position === 'left' && "right-[-8px] top-1/2 -translate-y-1/2 border-b-0 border-l-0",
              step.position === 'right' && "left-[-8px] top-1/2 -translate-y-1/2 border-t-0 border-r-0"
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
