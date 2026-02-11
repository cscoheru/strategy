'use client';

import { Step } from '@/types/strategy';
import { Check, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
}

const steps: { value: Step; label: string }[] = [
  { value: 1, label: '业绩复盘' },
  { value: 2, label: '市场与机会' },
  { value: 3, label: '设定目标' },
  { value: 4, label: '任务分解' },
  { value: 'report', label: '报告' },
];

export default function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  const getStepStatus = (step: Step): 'completed' | 'active' | 'upcoming' => {
    const stepIndex = steps.findIndex(s => s.value === step);
    const currentIndex = steps.findIndex(s => s.value === currentStep);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-8 py-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.value);
            const isClickable = onStepClick && (status === 'completed' || status === 'active');

            return (
              <li key={step.value} className="flex-1">
                <div className="flex items-center">
                  {index > 0 && (
                    <div className="absolute h-0.5 w-full bg-gray-200 dark:bg-slate-700 top-1/2 left-0 -translate-y-1/2" />
                  )}
                  <button
                    onClick={() => isClickable && onStepClick(step.value)}
                    disabled={!isClickable}
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-200 z-10
                      ${status === 'completed'
                        ? 'bg-primary-500 text-white'
                        : status === 'active'
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </button>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      status === 'completed' || status === 'active'
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
