import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ChevronRight, Activity, Circle, Flag } from "lucide-react";

interface ProcessWithMeasures {
  id: string;
  name: string;
  processNumber: string;
  description?: string;
  status: string;
  measures?: {
    id: string;
    name: string;
  }[];
}

interface GoalWithProcesses {
  id: string;
  title: string;
  description?: string;
  category: string; // Scorecard flag (Financial, Customer, Internal Process, Learning & Growth)
  priority: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  element?: {
    id: string;
    title: string;
    elementNumber: number;
  };
  processes: ProcessWithMeasures[];
}

interface GoalsProcessesMindMapProps {
  goals: GoalWithProcesses[];
}

// Scorecard category colors and icons
const getScorecardStyle = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'financial':
      return {
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-900 dark:text-green-100',
        accent: 'bg-green-500',
        flag: '💰'
      };
    case 'customer':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-100',
        accent: 'bg-blue-500',
        flag: '👥'
      };
    case 'internal process':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-900 dark:text-purple-100',
        accent: 'bg-purple-500',
        flag: '⚙️'
      };
    case 'learning & growth':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-900 dark:text-orange-100',
        accent: 'bg-orange-500',
        flag: '📚'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-900 dark:text-gray-100',
        accent: 'bg-gray-500',
        flag: '📊'
      };
  }
};

export function GoalsProcessesMindMap({ goals }: GoalsProcessesMindMapProps) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No strategic goals with linked processes to display</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" data-mindmap-content="goals-processes">
      {goals.map((goal) => {
        const goalStyle = getScorecardStyle(goal.category);
        
        return (
          <div key={goal.id} className="relative">
            {/* Goal Card - Root Node */}
            <Card className={`${goalStyle.bg} ${goalStyle.border} shadow-lg border-2`}>
              <CardContent className="p-6">
                {/* Goal Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-16 h-16 ${goalStyle.accent} rounded-lg flex items-center justify-center flex-shrink-0 text-2xl`}>
                    {goalStyle.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className={`text-xl font-bold ${goalStyle.text}`}>
                        {goal.title}
                      </h2>
                      <Badge variant="outline" className="text-sm">
                        {goal.category} Scorecard
                      </Badge>
                    </div>
                    {goal.description && (
                      <p className="text-muted-foreground mb-3">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="secondary" className="text-sm">
                        Priority: {goal.priority}
                      </Badge>
                      {goal.element && (
                        <Badge variant="outline" className="text-sm">
                          Element {goal.element.elementNumber}: {goal.element.title}
                        </Badge>
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${goalStyle.accent}`}
                          style={{ 
                            width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Processes */}
            {goal.processes && goal.processes.length > 0 && (
              <div className="ml-8 mt-4 space-y-4">
                {/* Connection Line */}
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-8 h-0.5 bg-border"></div>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Linked Processes ({goal.processes.length})</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {goal.processes.map((process) => {
                    const processStyle = getScorecardStyle(goal.category);
                    
                    return (
                      <Card key={process.id} className="bg-white dark:bg-gray-800 border border-gray-200 shadow-md">
                        <CardContent className="p-4">
                          {/* Process Header with Scorecard Flag */}
                          <div className="flex items-start space-x-3 mb-3">
                            <div className={`w-12 h-12 ${processStyle.accent} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {process.processNumber}
                                </span>
                                <Badge 
                                  variant={process.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {process.status}
                                </Badge>
                                {/* Scorecard Flag for Process */}
                                <Badge variant="outline" className="text-xs flex items-center space-x-1">
                                  <span>{processStyle.flag}</span>
                                  <span>{goal.category}</span>
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                                {process.name}
                              </h4>
                              {process.description && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {process.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Metrics Section */}
                          {process.measures && process.measures.length > 0 && (
                            <div className="border-t pt-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <Circle className="w-3 h-3 text-blue-500 fill-current" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Performance Measures ({process.measures.length})
                                </span>
                              </div>
                              <div className="space-y-1">
                                {process.measures.map((measure) => (
                                  <div key={measure.id} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                      {measure.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No measures indicator */}
                          {(!process.measures || process.measures.length === 0) && (
                            <div className="border-t pt-3">
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Circle className="w-3 h-3 opacity-30" />
                                <span className="text-xs">No performance measures defined</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No processes linked indicator */}
            {(!goal.processes || goal.processes.length === 0) && (
              <div className="ml-8 mt-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-8 h-0.5 bg-border"></div>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm">No processes linked to this goal</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}