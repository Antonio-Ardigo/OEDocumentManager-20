import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowDown, FileText } from "lucide-react";
import type { ProcessStep, OeElement } from "@shared/schema";

interface ProcessFlowDiagramProps {
  processName: string;
  processNumber: string;
  steps: ProcessStep[];
  element?: OeElement | null;
}

export default function ProcessFlowDiagram({ processName, processNumber, steps, element }: ProcessFlowDiagramProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  // Create visual styles based on process type (all horizontal now)
  const getProcessStyles = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-50',
          accent: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'OE-4.2':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-50',
          accent: 'text-green-700',
          border: 'border-green-200'
        };
      default:
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-50',
          accent: 'text-purple-700',
          border: 'border-purple-200'
        };
    }
  };

  const styles = getProcessStyles(processNumber);
  
  // Get enabling elements for process from OE Elements or fallback to defaults
  const getEnablingElements = (processNumber: string) => {
    // Try to get enabling elements from the current element's data
    if (element?.enablingElements && element.enablingElements.length > 0) {
      return element.enablingElements;
    }
    
    // Fallback to process-specific defaults if no custom elements are defined
    switch (processNumber) {
      case 'OE-4.1':
        return ['Risk Management', 'Document Control', 'Change Management', 'Quality Assurance'];
      case 'OE-4.2':
        return ['Performance Monitoring', 'Maintenance Planning', 'Inspection Programs', 'Asset Integrity'];
      default:
        return ['Quality Management', 'Risk Assessment', 'Documentation', 'Training'];
    }
  };

  const enablingElements = getEnablingElements(processNumber);
  
  // Get process description
  const getProcessDescription = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          purpose: "This process ensures effective management of physical assets throughout their entire lifecycle from design and procurement through construction, commissioning, and handover to operations.",
          scope: "Applies to all major capital projects, equipment procurement, and infrastructure development within WSM operations.",
          expectedOutcomes: ["Optimized asset performance", "Cost-effective procurement", "Quality construction delivery", "Smooth operational handover"]
        };
      case 'OE-4.2':
        return {
          purpose: "This process establishes systematic approaches for maintaining asset integrity, optimizing performance, and ensuring safe and reliable operations throughout the asset lifecycle.",
          scope: "Covers all operational assets including facilities, equipment, and infrastructure systems under WSM management.",
          expectedOutcomes: ["Maximum asset uptime", "Predictive maintenance", "Cost optimization", "Safety compliance"]
        };
      default:
        return {
          purpose: "This process defines systematic approaches for managing operational excellence activities within the organization.",
          scope: "Applies to all relevant organizational activities and stakeholders.",
          expectedOutcomes: ["Improved efficiency", "Enhanced quality", "Risk mitigation", "Continuous improvement"]
        };
    }
  };

  const processDesc = getProcessDescription(processNumber);


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
          <div className="flex flex-row items-center justify-start space-x-3 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                {/* Step Box */}
                <div 
                  className={`min-w-32 max-w-48 ${styles.secondary} ${styles.border} rounded-lg p-3 border hover:shadow-sm transition-all duration-200 cursor-pointer group`}
                  data-testid={`flow-step-${index}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-6 h-6 ${styles.primary} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-xs ${styles.accent} group-hover:text-primary leading-tight`}>
                        {step.stepName}
                      </h4>
                    </div>
                  </div>
                  
                  {step.stepDetails && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.stepDetails}
                    </p>
                  )}
                  
                  {step.responsibilities && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground">
                        {step.responsibilities}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow connector (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center mx-2">
                    <ChevronRight 
                      className={`w-4 h-4 ${styles.accent}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Process Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Purpose
                </h4>
                <p className="text-sm text-muted-foreground">{processDesc.purpose}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Scope</h4>
                <p className="text-sm text-muted-foreground">{processDesc.scope}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Expected Outcomes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {processDesc.expectedOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-2 h-2 ${styles.primary} rounded-full mr-2`}></div>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Enabling Elements */}
          <div className={`${styles.secondary} ${styles.border} rounded-lg p-4 border`}>
            <h4 className="font-semibold text-sm mb-3">Enabling OE Elements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {enablingElements.map((enablingElement: string, index: number) => (
                <div key={index} className={`bg-white rounded px-3 py-2 text-center border ${styles.border}`}>
                  <span className={`text-xs font-medium ${styles.accent}`}>{enablingElement}</span>
                </div>
              ))}
            </div>
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
                Horizontal Flow
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}