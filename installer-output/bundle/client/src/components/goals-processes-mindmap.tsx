import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, ChevronDown, Activity, Circle, BarChart3 } from "lucide-react";

interface ProcessWithMeasures {
  id: string;
  name: string;
  processNumber: string;
  description?: string;
  status: string;
  measures?: {
    id: string;
    name: string;
    formula?: string;
    target?: string;
    frequency?: string;
    source?: string;
    scorecardCategory?: string;
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

export const GoalsProcessesMindMap = forwardRef<any, GoalsProcessesMindMapProps>(({ goals }, ref) => {
  // Initialize with all goals expanded by default
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(() => {
    return new Set(goals?.map(goal => goal.id) || []);
  });
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());

  const toggleGoal = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const toggleProcess = (processId: string) => {
    setExpandedProcesses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(processId)) {
        newSet.delete(processId);
      } else {
        newSet.add(processId);
      }
      return newSet;
    });
  };

  // Expose expand/collapse methods via ref
  useImperativeHandle(ref, () => ({
    expandAll: () => {
      // Expand all goals
      const allGoalIds = new Set(goals?.map(goal => goal.id) || []);
      setExpandedGoals(allGoalIds);
      
      // Expand all processes
      const allProcessIds = new Set<string>();
      goals?.forEach(goal => {
        goal.processes?.forEach(process => {
          allProcessIds.add(process.id);
        });
      });
      setExpandedProcesses(allProcessIds);
    },
    collapseAll: () => {
      // Hide all processes by collapsing goals completely
      setExpandedGoals(new Set());
      setExpandedProcesses(new Set());
    }
  }), [goals]);

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
              <CardContent className="p-4">
                {/* Goal Header */}
                <div className="flex items-center space-x-3">
                  {/* Expand/Collapse Button */}
                  {goal.processes && goal.processes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleGoal(goal.id);
                      }}
                      data-testid={`toggle-goal-${goal.id}`}
                    >
                      {expandedGoals.has(goal.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <div className={`w-12 h-12 ${goalStyle.accent} rounded-lg flex items-center justify-center flex-shrink-0 text-xl`}>
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
                      {goal.processes && (
                        <Badge variant="outline" className="text-xs">
                          {goal.processes.length} processes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Processes */}
            {goal.processes && goal.processes.length > 0 && expandedGoals.has(goal.id) && (
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
                            {/* Process Expand/Collapse */}
                            {process.measures && process.measures.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleProcess(process.id);
                                }}
                                data-testid={`toggle-process-${process.id}`}
                              >
                                {expandedProcesses.has(process.id) ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            
                            <div className={`w-8 h-8 ${processStyle.accent} rounded flex items-center justify-center flex-shrink-0`}>
                              <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{process.processNumber}</span>
                                <Badge variant="outline" className="text-xs">
                                  {processStyle.flag}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {process.measures?.length || 0} KPIs
                                </Badge>
                              </div>
                              <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                                {process.name}
                              </h4>
                            </div>
                          </div>

                          {/* Enhanced Performance Measures Display */}
                          {process.measures && process.measures.length > 0 && expandedProcesses.has(process.id) && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                  {process.measures.length} Performance Measures
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {process.measures.map((measure) => (
                                  <div key={measure.id} className="bg-white dark:bg-gray-800 rounded p-2 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start space-x-2">
                                      <Circle className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                      <div className="flex-1">
                                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                                          {measure.name}
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {measure.scorecardCategory && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                              {getScorecardStyle(measure.scorecardCategory).flag} {measure.scorecardCategory}
                                            </Badge>
                                          )}
                                          {measure.formula && (
                                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                              Formula: {measure.formula}
                                            </Badge>
                                          )}
                                          {measure.target && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                              Target: {measure.target}
                                            </Badge>
                                          )}
                                          {measure.frequency && (
                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                              {measure.frequency}
                                            </Badge>
                                          )}
                                          {measure.source && (
                                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                              {measure.source}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Collapsed KPI Summary */}
                          {process.measures && process.measures.length > 0 && !expandedProcesses.has(process.id) && (
                            <div 
                              className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleProcess(process.id);
                              }}
                            >
                              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                                <BarChart3 className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  {process.measures.length} KPIs - Click to expand
                                </span>
                                <ChevronRight className="w-3 h-3 ml-auto" />
                              </div>
                            </div>
                          )}

                          {/* No measures indicator */}
                          {(!process.measures || process.measures.length === 0) && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                              <div className="flex items-center justify-center space-x-2 text-gray-500">
                                <Circle className="w-4 h-4 opacity-50" />
                                <span className="text-sm font-medium">No Performance Measures</span>
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
});