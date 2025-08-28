import { ChevronRight, ArrowDown } from "lucide-react";
import type { ProcessStep } from "@shared/schema";

interface MiniProcessFlowProps {
  processNumber: string;
  steps: ProcessStep[];
  compact?: boolean;
}

export default function MiniProcessFlow({ processNumber, steps, compact = false }: MiniProcessFlowProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
        No steps defined
      </div>
    );
  }

  // Get process-specific styling
  const getProcessStyles = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-50',
          accent: 'text-blue-600',
          border: 'border-blue-200'
        };
      case 'OE-4.2':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-50',
          accent: 'text-green-600',
          border: 'border-green-200'
        };
      default:
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-50',
          accent: 'text-purple-600',
          border: 'border-purple-200'
        };
    }
  };

  const styles = getProcessStyles(processNumber);
  const displaySteps = compact ? steps.slice(0, 4) : steps;
  const hasMoreSteps = compact && steps.length > 4;

  return (
    <div className="w-full">
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {displaySteps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            {/* Step Box */}
            <div 
              className={`${styles.secondary} ${styles.border} rounded px-2 py-1 border transition-all duration-200 hover:shadow-sm`}
              title={`${step.stepName}${step.stepDetails ? ': ' + step.stepDetails : ''}`}
            >
              <div className="flex items-center space-x-1">
                <div className={`w-4 h-4 ${styles.primary} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {step.stepNumber}
                </div>
                <span className={`text-xs font-medium ${styles.accent} truncate max-w-16`}>
                  {step.stepName.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Arrow connector (except for last step) */}
            {index < displaySteps.length - 1 && (
              <ChevronRight className={`w-3 h-3 ${styles.accent} mx-1`} />
            )}
          </div>
        ))}

        {/* More steps indicator */}
        {hasMoreSteps && (
          <div className="flex items-center space-x-1">
            <ChevronRight className={`w-3 h-3 ${styles.accent}`} />
            <div className={`${styles.secondary} ${styles.border} rounded px-2 py-1 border`}>
              <span className={`text-xs ${styles.accent} font-medium`}>
                +{steps.length - 4} more
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Process flow summary */}
      {!compact && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">{steps.length} steps:</span>
          <span className="ml-1">
            {processNumber === 'OE-4.1' && 'Design → Procure → Construct → Commission'}
            {processNumber === 'OE-4.2' && 'Strategy → Operate → Monitor → Improve'}
            {!['OE-4.1', 'OE-4.2'].includes(processNumber) && 'Sequential Process Flow'}
          </span>
        </div>
      )}
    </div>
  );
}