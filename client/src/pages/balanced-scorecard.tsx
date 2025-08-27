import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Edit3,
  Save,
  X,
  Plus
} from "lucide-react";
import type { OeElementWithProcesses } from "@shared/schema";

interface StrategicGoal {
  id: string;
  elementId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'Financial' | 'Customer' | 'Internal Process' | 'Learning & Growth';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
  updatedAt: string;
}

interface PerformanceMetric {
  id: string;
  elementId: string;
  metricName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export default function BalancedScorecard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: 0,
    unit: '',
    category: 'Financial' as const,
    priority: 'Medium' as const,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: elements, isLoading: elementsLoading, error } = useQuery<OeElementWithProcesses[]>({
    queryKey: ["/api/oe-elements"],
    enabled: isAuthenticated,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<StrategicGoal[]>({
    queryKey: ["/api/strategic-goals"],
    enabled: isAuthenticated,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/performance-metrics"],
    enabled: isAuthenticated,
  });

  // Handle error
  useEffect(() => {
    if (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load balanced scorecard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      await apiRequest('/api/strategic-goals', 'POST', goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategic-goals"] });
      setNewGoal({
        title: '',
        description: '',
        targetValue: 0,
        unit: '',
        category: 'Financial',
        priority: 'Medium',
      });
      toast({
        title: "Success",
        description: "Strategic goal created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create strategic goal",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest(`/api/strategic-goals/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategic-goals"] });
      setEditingGoal(null);
      toast({
        title: "Success",
        description: "Strategic goal updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update strategic goal",
        variant: "destructive",
      });
    },
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financial':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Customer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Internal Process':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Learning & Growth':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGoalsForElement = (elementId: string) => {
    return goals.filter(goal => goal.elementId === elementId);
  };

  const getMetricsForElement = (elementId: string) => {
    return metrics.filter(metric => metric.elementId === elementId);
  };

  if (isLoading || elementsLoading || goalsLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg">Loading balanced scorecard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Balanced Scorecard</h1>
              <p className="text-muted-foreground">Strategic goals and performance metrics for operational excellence</p>
            </div>
          </div>
        </div>

        {/* Strategic Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].map((category) => {
            const categoryGoals = goals.filter(goal => goal.category === category);
            const totalGoals = categoryGoals.length;
            const achievedGoals = categoryGoals.filter(goal => goal.currentValue >= goal.targetValue).length;
            const percentage = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;
            
            return (
              <Card key={category} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>Performance Overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Goals Achieved</span>
                    <span className="text-sm font-medium">{achievedGoals}/{totalGoals}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Elements and Their Scorecards */}
        <div className="space-y-8">
          {elements?.map((element) => {
            const elementGoals = getGoalsForElement(element.id);
            const elementMetrics = getMetricsForElement(element.id);
            
            return (
              <Card key={element.id} className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">
                    OE Element {element.elementNumber}: {element.title}
                  </CardTitle>
                  <CardDescription>{element.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Performance Metrics */}
                  {elementMetrics.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Performance Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {elementMetrics.map((metric) => (
                          <Card key={metric.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{metric.metricName}</h4>
                                {getTrendIcon(metric.trend)}
                              </div>
                              <div className="text-2xl font-bold mb-1">
                                {metric.currentValue}{metric.unit}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Target: {metric.targetValue}{metric.unit}
                              </div>
                              <div className="text-sm">
                                <span className={`font-medium ${metric.percentage >= 100 ? 'text-green-600' : metric.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {metric.percentage}% of target
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Goals */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Strategic Goals
                    </h3>
                    
                    {elementGoals.length > 0 ? (
                      <div className="space-y-4">
                        {elementGoals.map((goal) => (
                          <Card key={goal.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold">{goal.title}</h4>
                                    <Badge className={getCategoryColor(goal.category)}>
                                      {goal.category}
                                    </Badge>
                                    <Badge variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'secondary'}>
                                      {goal.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Current: </span>
                                      <span className="font-medium">{goal.currentValue}{goal.unit}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Target: </span>
                                      <span className="font-medium">{goal.targetValue}{goal.unit}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all ${
                                          goal.currentValue >= goal.targetValue ? 'bg-green-500' : 
                                          goal.currentValue >= goal.targetValue * 0.75 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-right mt-1">
                                      <span className="text-sm font-medium">
                                        {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed border-2">
                        <CardContent className="p-8 text-center">
                          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="text-lg font-medium mb-2">No Strategic Goals</h4>
                          <p className="text-muted-foreground mb-4">
                            Add strategic goals to track performance for this OE element.
                          </p>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Strategic Goal
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add New Goal Section */}
        <Card className="mt-8 border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Strategic Goal
            </CardTitle>
            <CardDescription>
              Create a new strategic goal for any OE element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <select
                  id="goal-category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Financial">Financial</option>
                  <option value="Customer">Customer</option>
                  <option value="Internal Process">Internal Process</option>
                  <option value="Learning & Growth">Learning & Growth</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Value</Label>
                <Input
                  id="goal-target"
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter target value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-unit">Unit</Label>
                <Input
                  id="goal-unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  placeholder="e.g., %, $, hours"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe the strategic goal and how it will be measured"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => createGoalMutation.mutate(newGoal)}
                disabled={!newGoal.title || !newGoal.description || createGoalMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}