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

      {/* Tree Structure - Left Indented */}
      <div className="space-y-4">
        {processes.map((process, processIndex) => (
          <div key={process.id} className="relative">
            {/* Connection Line from Root */}
            <div className="absolute left-6 top-0 w-0.5 h-full bg-border/40"></div>
            
            {/* Process Node - Indented */}
            <div className="flex items-start ml-12">
              <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-3 mr-4 relative z-10"></div>
              <div className="flex-1 min-w-0">
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-md mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
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
                  </CardContent>
                </Card>

                {/* Process Steps - Further Indented */}
                {process.steps && process.steps.length > 0 && (
                  <div className="ml-6 space-y-3">
                    {process.steps.map((step, stepIndex) => (
                      <div key={step.id} className="relative">
                        {/* Connection Line for Steps */}
                        <div className="absolute left-6 top-0 w-0.5 h-full bg-border/30"></div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 relative z-10"></div>
                          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 flex-1 shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-start space-x-3">
                                {/* Bullet Point with Step Number */}
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  <Circle className="w-2 h-2 fill-green-600 text-green-600" />
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {step.stepNumber}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-medium text-sm text-green-700 dark:text-green-300 leading-tight mb-1">
                                    • {step.stepName}
                                  </h5>
                                  {step.stepDetails && (
                                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                                      {/* Split details into bullet points */}
                                      {step.stepDetails.split('. ').slice(0, 3).map((detail, idx) => (
                                        <div key={idx} className="flex items-start space-x-1">
                                          <Circle className="w-1.5 h-1.5 fill-green-400 text-green-400 flex-shrink-0 mt-1.5" />
                                          <span className="leading-tight">
                                            {detail.trim()}{detail.includes('.') ? '' : '.'}
                                          </span>
                                        </div>
                                      ))}
                                      {step.stepDetails.split('. ').length > 3 && (
                                        <div className="flex items-center space-x-1 mt-1">
                                          <Circle className="w-1.5 h-1.5 fill-green-400 text-green-400" />
                                          <span className="italic">...and more</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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