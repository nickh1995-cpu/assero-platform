import styles from './ProgressStepper.module.css';

interface Step {
  number: number;
  label: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        
        return (
          <div key={step.number} className={styles.stepWrapper}>
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${
                  isActive ? styles.active : ''
                } ${isCompleted ? styles.completed : ''}`}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.3334 4L6.00002 11.3333L2.66669 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`${styles.stepConnector} ${
                  isCompleted ? styles.completed : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

