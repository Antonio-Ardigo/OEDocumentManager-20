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

  // Group goals by scorecard category
  const groupedGoals = goals.reduce((acc, goal) => {
    const category = goal.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(goal);
    return acc;
  }, {} as Record<string, GoalWithProcesses[]>);

  return (
    <div className="w-full space-y-8" data-mindmap-content="goals-processes">
      {Object.entries(groupedGoals).map(([category, categoryGoals]) => {
        const style = getScorecardStyle(category);
        
        return (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 ${style.accent} rounded-lg flex items-center justify-center text-white text-lg`}>
                {style.flag}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Flag className="w-5 h-5" />
                  <span>{category} Scorecard</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {categoryGoals.length} strategic goal{categoryGoals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Goals in this category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryGoals.map((goal) => (
                <div key={goal.id} className="relative">
                  {/* Goal Card */}
                  <Card className={`${style.bg} ${style.border} shadow-md`}>
                    <CardContent className="p-6">
                      {/* Goal Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 ${style.accent} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold ${style.text} mb-1`}>
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Priority: {goal.priority}
                            </Badge>
                            {goal.element && (
                              <Badge variant="secondary" className="text-xs">
                                Element {goal.element.elementNumber}
                              </Badge>
                            )}
                          </div>
                          {/* Progress */}
                          <div className="text-xs text-muted-foreground">
                            Progress: {goal.currentValue}/{goal.targetValue} {goal.unit}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${style.accent}`}
                                style={{ 
                                  width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Connected Processes */}
                      {goal.processes && goal.processes.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                            <ChevronRight className="w-4 h-4" />
                            <span>Linked Processes ({goal.processes.length})</span>
                          </div>
                          <div className="space-y-2">
                            {goal.processes.map((process) => (
                              <Card key={process.id} className="bg-white/80 border border-gray-200">
                                <CardContent className="p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                                      <Activity className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-blue-900">
                                          {process.processNumber}
                                        </span>
                                        <Badge 
                                          variant={process.status === 'active' ? 'default' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {process.status}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-blue-700 truncate">{process.name}</p>
                                      {process.measures && process.measures.length > 0 && (
                                        <div className="flex items-center space-x-1 mt-1">
                                          <Circle className="w-2 h-2 text-blue-400 fill-current" />
                                          <span className="text-xs text-blue-600">
                                            {process.measures.length} measure{process.measures.length !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No processes linked */}
                      {(!goal.processes || goal.processes.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No processes linked</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}