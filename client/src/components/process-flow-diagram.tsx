import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowDown } from "lucide-react";
import type { ProcessStep } from "@shared/schema";

interface ProcessFlowDiagramProps {
  processName: string;
  processNumber: string;
  steps: ProcessStep[];
}

export default function ProcessFlowDiagram({ processName, processNumber, steps }: ProcessFlowDiagramProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  // Create visual styles based on process type
  const getProcessStyles = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-100',
          accent: 'text-blue-700',
          flow: 'horizontal'
        };
      case 'OE-4.2':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-100',
          accent: 'text-green-700',
          flow: 'vertical'
        };
      default:
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-100',
          accent: 'text-purple-700',
          flow: 'horizontal'
        };
    }
  };

  const styles = getProcessStyles(processNumber);
  const isHorizontal = styles.flow === 'horizontal';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div 
            className={`w-6 h-6 ${styles.primary} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
          >
            {steps.length}
          </div>
          <span>Process Flow Overview</span>
          <Badge variant="outline" className={styles.accent}>
            {processNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Process Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{processName}</h3>
            <p className="text-sm text-muted-foreground">
              {steps.length} step{steps.length !== 1 ? 's' : ''} in this process
            </p>
          </div>

          {/* Flow Diagram */}
          <div className={`flex ${isHorizontal ? 'flex-row items-center justify-center space-x-2 overflow-x-auto pb-4' : 'flex-col items-center space-y-3'}`}>
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Box */}
                <div 
                  className={`${isHorizontal ? 'min-w-48 max-w-64' : 'w-80'} ${styles.secondary} rounded-lg p-4 border-2 border-transparent hover:border-primary/30 transition-all duration-200 cursor-pointer group`}
                  data-testid={`flow-step-${index}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 ${styles.primary} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${styles.accent} group-hover:text-primary`}>
                        {step.stepName}
                      </h4>
                    </div>
                  </div>
                  
                  {step.stepDetails && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {step.stepDetails.length > 80 
                        ? `${step.stepDetails.substring(0, 80)}...`
                        : step.stepDetails
                      }
                    </p>
                  )}
                  
                  {step.responsibilities && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground">
                        Owner: {step.responsibilities.split(',')[0].trim()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow connector (except for last step) */}
                {index < steps.length - 1 && (
                  <div className={`flex items-center justify-center ${isHorizontal ? 'mx-2' : 'my-2'}`}>
                    {isHorizontal ? (
                      <ChevronRight 
                        className={`w-6 h-6 ${styles.accent} animate-pulse`}
                      />
                    ) : (
                      <ArrowDown 
                        className={`w-6 h-6 ${styles.accent} animate-pulse`}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Process Summary */}
          <div className={`${styles.secondary} rounded-lg p-4 border border-border/50`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Process Summary:</span>
                <span className="text-muted-foreground">
                  {processNumber === 'OE-4.1' && 'Design → Procure → Construct → Commission'}
                  {processNumber === 'OE-4.2' && 'Strategy → Operate → Monitor → Improve'}
                  {!['OE-4.1', 'OE-4.2'].includes(processNumber) && 'Sequential Process Flow'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {isHorizontal ? 'Horizontal Flow' : 'Vertical Flow'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}