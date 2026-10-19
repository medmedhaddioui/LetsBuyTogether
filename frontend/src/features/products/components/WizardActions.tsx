import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardActionsProps {
  steps: string[];
  step: number;
  busy: boolean;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onReview: () => void;
}

/** Navigation and final confirmation for the product creation wizard. */
export function WizardActions({
  steps,
  step,
  busy,
  submitting,
  submitLabel,
  submittingLabel,
  onPrevious,
  onNext,
  onReview,
}: WizardActionsProps) {
  const last = step === steps.length - 1;
  const nextIsReview = step === steps.length - 2;
  return (
    <footer className="wizard-actions" aria-label="Step actions">
      <div className="wizard-actions-back">
        <button
          type="button"
          className="wizard-action wizard-action-secondary"
          disabled={step === 0 || busy}
          onClick={onPrevious}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </button>
        <span className="wizard-actions-progress">
          Step {step + 1} of {steps.length}
        </span>
      </div>
      <div className="wizard-actions-forward">
        {!last && !nextIsReview && (
          <button
            type="button"
            className="wizard-action wizard-action-secondary"
            disabled={busy}
            onClick={onReview}
          >
            {steps[steps.length - 1]}
          </button>
        )}
        <button
          type={last ? "submit" : "button"}
          className="wizard-action wizard-action-primary"
          disabled={busy}
          onClick={last ? undefined : onNext}
        >
          <span>
            {submitting
              ? submittingLabel
              : busy
                ? "Checking…"
                : last
                  ? submitLabel
                  : nextIsReview
                    ? steps[step + 1]
                    : `Next: ${steps[step + 1]}`}
          </span>
          {!last && <ChevronRight size={16} aria-hidden="true" />}
        </button>
      </div>
    </footer>
  );
}
