/**
 * Reusable action buttons for result cards
 * Used in PostResultCard, QuoteResultCard, and synthesis cards
 */

interface Action {
  label: string;
  onClick: () => void;
  title?: string;
  className?: string;
}

interface ResultCardActionsProps {
  actions: Action[];
}

export default function ResultCardActions({ actions }: ResultCardActionsProps) {
  return (
    <div className="result-actions">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`action-button ${action.className || ""}`}
          title={action.title}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
