import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ChevronRight, Activity, Circle, BarChart3 } from "lucide-react";

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
                    <div className="flex items-center space-x-2">
                      <h2 className={`text-lg font-bold ${goalStyle.text}`}>
                        {goal.title}
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {goal.priority}
                      </Badge>
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
                      <Card key={process.id} className="bg-white dark:bg-gray-800 border border-gray-200 shadow-sm">
                        <CardContent className="p-3">
                          {/* Compact Process Header */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-8 h-8 ${processStyle.accent} rounded flex items-center justify-center flex-shrink-0`}>
                              <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{process.processNumber}</span>
                                <Badge variant="outline" className="text-xs">
                                  {processStyle.flag}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                                {process.name}
                              </h4>
                            </div>
                          </div>

                          {/* Compact Performance Measures */}
                          {process.measures && process.measures.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 mb-1">
                                <BarChart3 className="w-3 h-3 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">
                                  {process.measures.length} KPIs
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {process.measures.slice(0, 4).map((measure, idx) => (
                                  <Badge key={measure.id} variant="secondary" className="text-xs px-1 py-0">
                                    {measure.name.length > 20 ? `${measure.name.substring(0, 17)}...` : measure.name}
                                  </Badge>
                                ))}
                                {process.measures.length > 4 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{process.measures.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* No measures indicator */}
                          {(!process.measures || process.measures.length === 0) && (
                            <div className="text-xs text-muted-foreground flex items-center space-x-1">
                              <Circle className="w-3 h-3 opacity-30" />
                              <span>No KPIs</span>
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