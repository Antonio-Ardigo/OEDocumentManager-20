import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ChevronRight, FileText } from "lucide-react";

interface ProcessStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepDetails?: string;
}

interface Process {
  id: string;
  processNumber: string;
  name: string;
  steps?: ProcessStep[];
}

interface MindMapTreeProps {
  processes: Process[];
  elementTitle: string;
}

export function MindMapTree({ processes, elementTitle }: MindMapTreeProps) {
  if (!processes || processes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No processes available to display in mind map</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Root Element */}
      <div className="flex justify-center mb-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <h3 className="font-bold text-primary text-lg">{elementTitle}</h3>
            <p className="text-sm text-muted-foreground">{processes.length} Processes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tree Structure */}
      <div className="space-y-6">
        {processes.map((process, processIndex) => (
          <div key={process.id} className="relative">
            {/* Connection Line from Root */}
            {processIndex === 0 && (
              <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-border transform -translate-x-1/2"></div>
            )}
            
            {/* Process Node */}
            <div className="flex items-start justify-center">
              <div className="flex flex-col items-center w-full max-w-6xl">
                {/* Process Card */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                          {process.processNumber}
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {process.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Steps */}
                {process.steps && process.steps.length > 0 && (
                  <div className="relative">
                    {/* Vertical line down from process */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-border transform -translate-x-1/2"></div>
                    
                    {/* Steps Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
                      {process.steps.map((step, stepIndex) => (
                        <div key={step.id} className="relative">
                          {/* Connection Line to Process */}
                          <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-border transform -translate-x-1/2"></div>
                          
                          {/* Horizontal Connection Line */}
                          {stepIndex > 0 && (
                            <div className="absolute -top-6 left-0 right-1/2 h-0.5 bg-border"></div>
                          )}
                          {stepIndex < process.steps!.length - 1 && (
                            <div className="absolute -top-6 left-1/2 right-0 h-0.5 bg-border"></div>
                          )}
                          
                          {/* Step Card */}
                          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 h-full">
                            <CardContent className="p-3">
                              <div className="flex items-start space-x-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                  {step.stepNumber}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-medium text-sm text-green-700 dark:text-green-300 leading-tight">
                                    {step.stepName}
                                  </h5>
                                  {step.stepDetails && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 line-clamp-2">
                                      {step.stepDetails.length > 100 
                                        ? `${step.stepDetails.substring(0, 100)}...` 
                                        : step.stepDetails
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Line to Next Process */}
            {processIndex < processes.length - 1 && (
              <div className="flex justify-center mt-6 mb-2">
                <div className="w-0.5 h-8 bg-border"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary/20 border-primary/40 border rounded"></div>
            <span>OE Element</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 border rounded"></div>
            <span>Process</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-950/40 border-green-300 dark:border-green-700 border rounded"></div>
            <span>Process Step</span>
          </div>
        </div>
      </div>
    </div>
  );
}