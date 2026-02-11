'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import ProgressIndicator from '@/components/ProgressIndicator';
import WelcomePage from '@/components/WelcomePage';
import SettingsModal from '@/components/SettingsModal';
import Step1Review from '@/components/Step1Review';
import Step2Insight from '@/components/Step2Insight';
import Step3Target from '@/components/Step3Target';
import Step4Execution from '@/components/Step4Execution';
import ReportPage from '@/components/ReportPage';
import DevTools from '@/components/DevTools';

export default function Home() {
  const { currentStep, isDarkMode, showWelcome, showSettings, initializeAuth } = useStore();

  useEffect(() => {
    // Initialize dark mode from localStorage
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('dark_mode') === 'true';
      if (savedDarkMode !== isDarkMode) {
        document.documentElement.classList.toggle('dark', savedDarkMode);
      } else {
        document.documentElement.classList.toggle('dark', isDarkMode);
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Initialize authentication status on app mount
    initializeAuth();
  }, []);

  // Show welcome page if needed
  if (showWelcome) {
    return <WelcomePage />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Review />;
      case 2:
        return <Step2Insight />;
      case 3:
        return <Step3Target />;
      case 4:
        return <Step4Execution />;
      case 'report':
        return <ReportPage />;
      default:
        return <Step1Review />;
    }
  };

  const canGoToStep = (step: typeof currentStep): boolean => {
    const stepIndex = [1, 2, 3, 4, 'report'].indexOf(step);
    const currentIndex = [1, 2, 3, 4, 'report'].indexOf(currentStep);
    return stepIndex <= currentIndex;
  };

  return (
    <>
      <SettingsModal />
      <Header />
      <ProgressIndicator currentStep={currentStep} onStepClick={canGoToStep ? (step) => {
        if (canGoToStep(step)) {
          useStore.getState().setStep(step);
        }
      } : undefined} />
      <main className="min-h-[calc(100vh-200px)]">
        {renderStep()}
      </main>
      <DevTools />
    </>
  );
}
