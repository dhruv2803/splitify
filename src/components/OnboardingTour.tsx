import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { api } from '../lib/api';
import { X, ChevronRight, ChevronLeft, Sparkles, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface Step {
  targetId: string;
  title: string;
  content: string;
  tab?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  altTargetId?: string;
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
    position: 'left',
    altTargetId: 'modal-add-category'
  },
  {
    targetId: 'btn-add-account',
    title: 'Connect your funding',
    content: 'Add your wallets, bank accounts, or credit cards to track your liquid assets in real-time.',
    tab: 'accounts',
    position: 'left',
    altTargetId: 'modal-add-account'
  },
  {
    targetId: 'btn-add-transaction',
    title: 'Log your activity',
    content: 'Record daily expenses or income. Your account balances will reconcile automatically.',
    tab: 'transactions',
    position: 'left',
    altTargetId: 'modal-add-transaction'
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

  // Reset positioning when step changes
  useEffect(() => {
    setTooltipStyle(prev => ({ ...prev, opacity: 0 }));
  }, [currentStep]);

  useEffect(() => {
    if (!isReady || !tooltipRef.current) return;

    const step = TOUR_STEPS[currentStep];
    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const tW = rect.width;
    const tH = rect.height;
    
    const padding = 16;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = 0;
    let top = 0;

    // Calculate ideal position
    if (step.position === 'top') {
      left = coords.left + coords.width / 2 - tW / 2;
      top = coords.top - tH - 16;
    } else if (step.position === 'bottom') {
      left = coords.left + coords.width / 2 - tW / 2;
      top = coords.top + coords.height + 16;
    } else if (step.position === 'left') {
      left = coords.left - tW - 16;
      top = coords.top + coords.height / 2 - tH / 2;
    } else { // right
      left = coords.left + coords.width + 16;
      top = coords.top + coords.height / 2 - tH / 2;
    }

    // Clamp to viewport
    const clampedLeft = Math.max(padding, Math.min(left, viewportW - tW - padding));
    const clampedTop = Math.max(padding, Math.min(top, viewportH - tH - padding));

    setTooltipStyle({
      left: `${clampedLeft}px`,
      top: `${clampedTop}px`,
      opacity: 1,
      transition: 'all 0.3s ease-out'
    });

    // Adjust arrow to still point to target center
    const targetCenterX = coords.left + coords.width / 2;
    const targetCenterY = coords.top + coords.height / 2;

    if (step.position === 'top' || step.position === 'bottom') {
      const arrowLeft = Math.max(20, Math.min(tW - 20, targetCenterX - clampedLeft));
      setArrowStyle({
        left: `${arrowLeft}px`,
        [step.position === 'top' ? 'bottom' : 'top']: '-8px',
        transform: 'translateX(-50%) rotate(45deg)',
        borderBottom: step.position === 'top' ? '1px solid #dbeafe' : 'none',
        borderRight: step.position === 'top' ? '1px solid #dbeafe' : 'none',
        borderTop: step.position === 'bottom' ? '1px solid #dbeafe' : 'none',
        borderLeft: step.position === 'bottom' ? '1px solid #dbeafe' : 'none',
      });
    } else {
      const arrowTop = Math.max(20, Math.min(tH - 20, targetCenterY - clampedTop));
      setArrowStyle({
        top: `${arrowTop}px`,
        [step.position === 'left' ? 'right' : 'left']: '-8px',
        transform: 'translateY(-50%) rotate(45deg)',
        borderTop: step.position === 'left' ? '1px solid #dbeafe' : 'none',
        borderRight: step.position === 'left' ? '1px solid #dbeafe' : 'none',
        borderBottom: step.position === 'right' ? '1px solid #dbeafe' : 'none',
        borderLeft: step.position === 'right' ? '1px solid #dbeafe' : 'none',
      });
    }
  }, [isReady, coords, currentStep, isOpen]);

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

  useEffect(() => {
    if (!isOpen) return;

    const observer = new MutationObserver(() => {
      updatePosition();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'id']
    });

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, currentStep]);

  const updatePosition = () => {
    const step = TOUR_STEPS[currentStep];
    
    // Prefer altTargetId if it exists in DOM
    const altElement = step.altTargetId ? document.getElementById(step.altTargetId) : null;
    const element = altElement || document.getElementById(step.targetId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      setIsReady(true);
      
      // Only scroll if it's the primary target (don't scroll for modals as they are centered)
      if (!altElement) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // If element not found (e.g. tab not switched yet), retry once
      setTimeout(() => {
        const retryAlt = step.altTargetId ? document.getElementById(step.altTargetId) : null;
        const retryEl = retryAlt || document.getElementById(step.targetId);
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
        localStorage.setItem(`onboarding_seen_${user.uid}`, 'true');
        // Mark as completed in Go backend
        await api.updateProfile({
          onboardingCompleted: true
        });
        toast.success('Onboarding completed');
      } catch (err) {
        console.error("Failed to update onboarding status", err);
        toast.error('Failed to save progress');
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
            style={tooltipStyle}
            ref={tooltipRef}
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-blue-100 ring-8 ring-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                      <Sparkles className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                </div>
                <button onClick={handleFinish} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2">{step.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{step.content}</p>

              <div className="flex items-center justify-between">
                <button 
                  onClick={handleFinish}
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
            <div 
              className="absolute w-4 h-4 bg-white"
              style={arrowStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
