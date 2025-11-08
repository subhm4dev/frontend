'use client';

import { motion } from 'motion/react';

/**
 * CheckoutSteps Component
 * 
 * Multi-step checkout progress indicator.
 * Shows current step and completed steps.
 */
export function CheckoutSteps({ currentStep, steps = ['Address', 'Payment', 'Review', 'Confirmation'] }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                    isCompleted
                      ? 'bg-amber-900 text-white'
                      : isCurrent
                      ? 'bg-amber-900 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent || isCompleted
                      ? 'text-amber-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-amber-900' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

