import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ChevronRight, FileText, Circle } from "lucide-react";

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
      {/* Root Element - Left Aligned */}
      <div className="mb-6">
        <Card className="bg-primary/10 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{elementTitle}</h3>
                <p className="text-sm text-muted-foreground">{processes.length} Process{processes.length !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree Structure - Parallel Processes */}
      <div className="relative">
        {/* Main vertical line from root */}
        <div className="absolute left-6 top-0 w-0.5 h-12 bg-border/40"></div>
        
        {/* Horizontal line for processes */}
        {processes.length > 1 && (
          <div className="absolute left-6 top-12 w-full h-0.5 bg-border/40"></div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          {processes.map((process, processIndex) => (
            <div key={process.id} className="relative">
              {/* Vertical line down to process */}
              <div className="absolute left-1/2 -top-12 w-0.5 h-12 bg-border/40 transform -translate-x-1/2"></div>
              
              {/* Process Card */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-base">
                        {process.processNumber}
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {process.name}
                      </p>
                    </div>
                  </div>

                  {/* Sequential Process Steps as Green Bullet Points */}
                  {process.steps && process.steps.length > 0 && (
                    <div className="space-y-2 pl-2">
                      <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 border-b border-blue-200 dark:border-blue-800 pb-1">
                        Sequential Steps:
                      </h5>
                      {process.steps.map((step, stepIndex) => (
                        <div key={step.id} className="flex items-start space-x-2 text-xs">
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 mt-1" />
                            <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {step.stepNumber}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-green-700 dark:text-green-300 leading-tight">
                              {step.stepName}
                            </p>
                            {step.stepDetails && (
                              <p className="text-green-600 dark:text-green-400 mt-1 leading-tight text-xs">
                                {step.stepDetails.length > 80 
                                  ? `${step.stepDetails.substring(0, 80)}...` 
                                  : step.stepDetails
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
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
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 fill-current text-muted-foreground" />
            <span>Bullet Point</span>
          </div>
        </div>
      </div>
    </div>
  );
}