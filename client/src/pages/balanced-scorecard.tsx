import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
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
  Plus,
  Trash2,
  FileText,
  Download
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

interface ProcessPerformanceMeasure {
  id: string;
  measureName: string;
  formula?: string;
  source?: string;
  frequency?: string;
  target?: string;
  scorecardCategory?: string;
  processId: string;
  elementId: string;
  elementNumber: number;
  elementTitle: string;
  processName: string;
  processNumber: string;
}

export default function BalancedScorecard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingGoalData, setEditingGoalData] = useState<Partial<StrategicGoal>>({});
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editingMetricData, setEditingMetricData] = useState<Partial<PerformanceMetric>>({});
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: 0,
    unit: '',
    category: 'Financial' as const,
    priority: 'Medium' as const,
  });


  const { data: elements, isLoading: elementsLoading, error } = useQuery<OeElementWithProcesses[]>({
    queryKey: ["/api/oe-elements"],
    enabled: true,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<StrategicGoal[]>({
    queryKey: ["/api/strategic-goals"],
    enabled: true,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/performance-metrics"],
    enabled: true,
  });

  // Fetch process performance measures with scorecard categories
  const { data: processPerformanceMeasures = [], isLoading: processMeasuresLoading } = useQuery<ProcessPerformanceMeasure[]>({
    queryKey: ["/api/scorecard/performance-measures"],
    enabled: true,
  });

  // Handle error
  useEffect(() => {
    if (error) {
      
      toast({
        title: "Error",
        description: "Failed to load balanced scorecard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Comprehensive PDF Export functionality
  const handleExportPDF = async () => {
    if (!elements || !goals || !processPerformanceMeasures) {
      toast({
        title: "No Data Available",
        description: "Please wait for data to load before exporting",
        variant: "destructive",
      });
      return;
    }

    try {
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let yPos = 20;

    // Helper function to add justified text with better overflow control
    const addJustifiedText = (text: string, x: number, fontSize: number = 9, maxWidth: number = 165, indent: number = 0) => {
      doc.setFontSize(fontSize);
      const availableWidth = maxWidth - indent;
      const lines = doc.splitTextToSize(text, availableWidth);
      
      lines.forEach((line: string) => {
        doc.text(line, x + indent, yPos);
        yPos += fontSize * 0.6 + 1;
      });
      
      return yPos;
    };
    
    // Helper function for chapter headings
    const addChapterHeading = (title: string, level: number = 1) => {
      checkNewPage(15);
      yPos += level === 1 ? 8 : 5;
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(level === 1 ? 12 : 10);
      doc.text(title.toUpperCase(), 20, yPos);
      
      if (level === 1) {
        doc.setLineWidth(0.3);
        doc.line(20, yPos + 1, 20 + doc.getTextWidth(title.toUpperCase()), yPos + 1);
      }
      
      yPos += level === 1 ? 6 : 4;
    };
    
    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace: number = 20) => {
      if (yPos + requiredSpace > 275) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Document Title Page
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('WSM OPERATIONAL EXCELLENCE', 105, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('BALANCED SCORECARD REPORT', 105, 65, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Strategic Goals & Performance Metrics', 105, 80, { align: 'center' });
    
    // Document info
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 110, { align: 'center' });
    doc.text('WSM Operational Excellence Framework', 105, 120, { align: 'center' });
    
    // Simple line separator
    doc.setLineWidth(0.5);
    doc.line(50, 130, 160, 130);
    
    doc.addPage();
    yPos = 20;

    // Chapter 1: Executive Summary
    addChapterHeading('1. EXECUTIVE SUMMARY', 1);
    
    doc.setFont('helvetica', 'normal');
    
    const totalElements = elements.length;
    const activeElements = elements.filter(e => e.isActive).length;
    const totalGoals = goals.length;
    const totalProcessMeasures = processPerformanceMeasures.length;
    
    // Calculate scorecard category distribution
    const categoryDistribution = ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].map(category => {
      const processesInCategory = processPerformanceMeasures
        .filter(measure => measure.scorecardCategory === category)
        .reduce((acc, measure) => {
          const key = `${measure.elementId}-${measure.processId}`;
          if (!acc.includes(key)) acc.push(key);
          return acc;
        }, [] as string[]);
      return { category, count: processesInCategory.length };
    });

    addJustifiedText(`This Balanced Scorecard report provides a comprehensive overview of WSM's Operational Excellence framework performance across all strategic dimensions. The report includes detailed analysis of ${totalGoals} strategic goals, ${totalProcessMeasures} performance measures, and ${totalElements} OE elements.`, 20, 9);
    yPos += 3;

    doc.setFont('helvetica', 'bold');
    addJustifiedText('Key Statistics:', 20, 9);
    doc.setFont('helvetica', 'normal');
    addJustifiedText(`• Active Elements: ${activeElements} of ${totalElements}`, 25, 8, 165, 5);
    addJustifiedText(`• Strategic Goals: ${totalGoals}`, 25, 8, 165, 5);
    addJustifiedText(`• Performance Measures: ${totalProcessMeasures}`, 25, 8, 165, 5);
    yPos += 2;

    doc.setFont('helvetica', 'bold');
    addJustifiedText('Scorecard Category Distribution:', 20, 9);
    doc.setFont('helvetica', 'normal');
    categoryDistribution.forEach(({ category, count }) => {
      addJustifiedText(`• ${category}: ${count} processes`, 25, 8, 165, 5);
    });
    yPos += 5;

    // Chapter 2: Strategic Goals Analysis
    addChapterHeading('2. STRATEGIC GOALS ANALYSIS', 1);
    
    if (goals.length > 0) {
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`The organization has established ${goals.length} strategic goals across all balanced scorecard categories. These goals are aligned with specific OE elements to ensure comprehensive coverage of operational excellence initiatives.`, 20, 9);
      yPos += 3;

      // Strategic goals by category
      ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].forEach(category => {
        const categoryGoals = goals.filter(g => g.category === category);
        
        if (categoryGoals.length > 0) {
          checkNewPage(30);
          addChapterHeading(`2.${['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].indexOf(category) + 1} ${category} Goals`, 2);
          
          categoryGoals.forEach((goal, index) => {
            checkNewPage(25);
            const goalElement = elements?.find(e => e.id === goal.elementId);
            
            doc.setFont('helvetica', 'bold');
            addJustifiedText(`Goal ${index + 1}: ${goal.title}`, 25, 8, 165, 5);
            
            doc.setFont('helvetica', 'normal');
            if (goalElement) {
              addJustifiedText(`OE Element: ${goalElement.elementNumber} - ${goalElement.title}`, 30, 8, 165, 10);
            }
            addJustifiedText(`Priority: ${goal.priority}`, 30, 8, 165, 10);
            addJustifiedText(`Target: ${goal.targetValue} ${goal.unit}`, 30, 8, 165, 10);
            addJustifiedText(`Current: ${goal.currentValue} ${goal.unit}`, 30, 8, 165, 10);
            
            if (goal.description) {
              doc.setFont('helvetica', 'bold');
              addJustifiedText('Description:', 30, 8, 165, 10);
              doc.setFont('helvetica', 'normal');
              addJustifiedText(goal.description, 35, 8, 165, 15);
            }
            
            yPos += 3;
          });
        }
      });
    } else {
      doc.setFont('helvetica', 'normal');
      addJustifiedText('No strategic goals have been defined yet. Consider establishing goals across all balanced scorecard categories.', 20, 9);
      yPos += 3;
    }

    // Chapter 3: Performance Measures Analysis
    addChapterHeading('3. PERFORMANCE MEASURES ANALYSIS', 1);
    
    if (processPerformanceMeasures.length > 0) {
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`The system tracks ${processPerformanceMeasures.length} performance measures across all OE elements. These measures are categorized according to the balanced scorecard framework to provide comprehensive performance visibility.`, 20, 9);
      yPos += 3;

      // Performance measures by category and element
      ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].forEach(category => {
        const categoryMeasures = processPerformanceMeasures.filter(m => m.scorecardCategory === category);
        
        if (categoryMeasures.length > 0) {
          checkNewPage(30);
          addChapterHeading(`3.${['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].indexOf(category) + 1} ${category} Measures`, 2);
          
          // Group by element
          const elementGroups = categoryMeasures.reduce((acc, measure) => {
            if (!acc[measure.elementId]) {
              acc[measure.elementId] = [];
            }
            acc[measure.elementId].push(measure);
            return acc;
          }, {} as Record<string, typeof categoryMeasures>);

          Object.entries(elementGroups).forEach(([elementId, measures]) => {
            checkNewPage(20);
            const element = elements?.find(e => e.id === elementId);
            
            doc.setFont('helvetica', 'bold');
            addJustifiedText(`Element ${element?.elementNumber || 'Unknown'}: ${element?.title || 'Unknown Element'}`, 25, 8, 165, 5);
            yPos += 2;
            
            measures.forEach((measure) => {
              checkNewPage(15);
              
              doc.setFont('helvetica', 'bold');
              addJustifiedText(`• ${measure.measureName}`, 30, 8, 165, 10);
              
              doc.setFont('helvetica', 'normal');
              addJustifiedText(`Process: ${measure.processNumber} - ${measure.processName}`, 35, 8, 165, 15);
              
              if (measure.target) {
                addJustifiedText(`Target: ${measure.target}`, 35, 8, 165, 15);
              }
              if (measure.frequency) {
                addJustifiedText(`Frequency: ${measure.frequency}`, 35, 8, 165, 15);
              }
              if (measure.source) {
                addJustifiedText(`Source: ${measure.source}`, 35, 8, 165, 15);
              }
              if (measure.formula) {
                addJustifiedText(`Formula: ${measure.formula}`, 35, 8, 165, 15);
              }
              
              yPos += 2;
            });
            
            yPos += 2;
          });
        }
      });
    } else {
      doc.setFont('helvetica', 'normal');
      addJustifiedText('No performance measures have been defined yet. Consider establishing measures across all scorecard categories.', 20, 9);
      yPos += 3;
    }

    // Chapter 4: Element Analysis
    addChapterHeading('4. OE ELEMENT ANALYSIS', 1);
    
    doc.setFont('helvetica', 'normal');
    addJustifiedText(`This section provides detailed analysis of each OE element's contribution to the balanced scorecard framework.`, 20, 9);
    yPos += 3;

    elements?.forEach((element, index) => {
      checkNewPage(30);
      addChapterHeading(`4.${index + 1} Element ${element.elementNumber}: ${element.title}`, 2);
      
      const elementGoals = goals.filter(g => g.elementId === element.id);
      const elementMeasures = processPerformanceMeasures.filter(m => m.elementId === element.id);
      
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`Status: ${element.isActive ? 'Active' : 'Inactive'}`, 25, 8, 165, 5);
      addJustifiedText(`Processes: ${element.processes?.length || 0}`, 25, 8, 165, 5);
      addJustifiedText(`Strategic Goals: ${elementGoals.length}`, 25, 8, 165, 5);
      addJustifiedText(`Performance Measures: ${elementMeasures.length}`, 25, 8, 165, 5);
      yPos += 2;
      
      if (element.description) {
        doc.setFont('helvetica', 'bold');
        addJustifiedText('Description:', 25, 8, 165, 5);
        doc.setFont('helvetica', 'normal');
        addJustifiedText(element.description, 30, 8, 165, 10);
        yPos += 2;
      }
      
      // Element scorecard distribution
      const elementCategoryDistribution = ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].map(category => ({
        category,
        count: elementMeasures.filter(m => m.scorecardCategory === category).length
      })).filter(item => item.count > 0);
      
      if (elementCategoryDistribution.length > 0) {
        doc.setFont('helvetica', 'bold');
        addJustifiedText('Scorecard Category Distribution:', 25, 8, 165, 5);
        doc.setFont('helvetica', 'normal');
        elementCategoryDistribution.forEach(({ category, count }) => {
          addJustifiedText(`• ${category}: ${count} measures`, 30, 8, 165, 10);
        });
        yPos += 2;
      }
      
      yPos += 3;
    });

    // Footer for all pages
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 285, 190, 285);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('WSM Balanced Scorecard Report', 20, 292);
      doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 292, { align: 'center' });
    }

    // Save the PDF
    doc.save(`WSM-Balanced-Scorecard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Export Successful",
      description: "Balanced Scorecard report has been exported as PDF",
    });
    
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF report",
        variant: "destructive",
      });
    }
  };

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
      setEditingGoalData({});
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

  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest(`/api/performance-metrics/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-metrics"] });
      setEditingMetric(null);
      setEditingMetricData({});
      toast({
        title: "Success",
        description: "Performance metric updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update performance metric",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiRequest('DELETE', `/api/strategic-goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategic-goals"] });
      toast({
        title: "Success",
        description: "Strategic goal deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete strategic goal",
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

  // Group process performance measures by scorecard category and element
  const getProcessMeasuresForElementAndCategory = (elementId: string, category: string) => {
    return processPerformanceMeasures.filter(measure => 
      measure.elementId === elementId && measure.scorecardCategory === category
    );
  };

  const getProcessMeasuresForElement = (elementId: string) => {
    return processPerformanceMeasures.filter(measure => measure.elementId === elementId);
  };

  if (elementsLoading || goalsLoading || metricsLoading || processMeasuresLoading) {
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
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Balanced Scorecard</h1>
                <p className="text-muted-foreground">Strategic goals and performance metrics for operational excellence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={elementsLoading || goalsLoading || metricsLoading || processMeasuresLoading || !elements || !goals || !processPerformanceMeasures}
                data-testid="button-export-scorecard"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Strategic Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].map((category) => {
            // Count unique processes per OE element that have measures in this category
            const processesInCategory = processPerformanceMeasures
              .filter(measure => measure.scorecardCategory === category)
              .reduce((acc, measure) => {
                const key = `${measure.elementId}-${measure.processId}`;
                if (!acc.includes(key)) {
                  acc.push(key);
                }
                return acc;
              }, [] as string[]);
            
            const processCount = processesInCategory.length;
            
            return (
              <Card key={category} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>Performance Overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">{processCount}</span>
                    <div className="text-sm text-muted-foreground">
                      {processCount === 1 ? 'Process' : 'Processes'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Strategic Goals Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Strategic Goals</h2>
              <p className="text-muted-foreground">Goals across all OE elements with element and scorecard relationships</p>
            </div>
          </div>
          
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const goalElement = elements?.find(e => e.id === goal.elementId);
                return (
                  <Card key={goal.id} className="border-2">
                    <CardContent className="p-6">
                      {editingGoal === goal.id ? (
                        // Edit form
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`goal-title-${goal.id}`}>Title</Label>
                            <Input
                              id={`goal-title-${goal.id}`}
                              value={editingGoalData.title || goal.title}
                              onChange={(e) => setEditingGoalData({
                                ...editingGoalData,
                                title: e.target.value
                              })}
                              data-testid={`input-goal-title-${goal.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`goal-element-${goal.id}`}>OE Element</Label>
                            <select
                              id={`goal-element-${goal.id}`}
                              value={editingGoalData.elementId || goal.elementId}
                              onChange={(e) => setEditingGoalData({
                                ...editingGoalData,
                                elementId: e.target.value
                              })}
                              className="w-full p-2 border rounded-md"
                              data-testid={`select-goal-element-${goal.id}`}
                            >
                              {elements?.map((element) => (
                                <option key={element.id} value={element.id}>
                                  OE {element.elementNumber}: {element.title}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`goal-category-${goal.id}`}>Scorecard Category</Label>
                            <select
                              id={`goal-category-${goal.id}`}
                              value={editingGoalData.category || goal.category}
                              onChange={(e) => setEditingGoalData({
                                ...editingGoalData,
                                category: e.target.value as StrategicGoal['category']
                              })}
                              className="w-full p-2 border rounded-md"
                              data-testid={`select-goal-category-${goal.id}`}
                            >
                              <option value="Financial">Financial</option>
                              <option value="Customer">Customer</option>
                              <option value="Internal Process">Internal Process</option>
                              <option value="Learning & Growth">Learning & Growth</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`goal-description-${goal.id}`}>Description</Label>
                            <Textarea
                              id={`goal-description-${goal.id}`}
                              value={editingGoalData.description || goal.description}
                              onChange={(e) => setEditingGoalData({
                                ...editingGoalData,
                                description: e.target.value
                              })}
                              className="min-h-[60px]"
                              data-testid={`textarea-goal-description-${goal.id}`}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`goal-current-${goal.id}`}>Current Value</Label>
                              <Input
                                id={`goal-current-${goal.id}`}
                                type="number"
                                value={editingGoalData.currentValue ?? goal.currentValue}
                                onChange={(e) => setEditingGoalData({
                                  ...editingGoalData,
                                  currentValue: parseFloat(e.target.value) || 0
                                })}
                                data-testid={`input-goal-current-${goal.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`goal-target-${goal.id}`}>Target Value</Label>
                              <Input
                                id={`goal-target-${goal.id}`}
                                type="number"
                                value={editingGoalData.targetValue ?? goal.targetValue}
                                onChange={(e) => setEditingGoalData({
                                  ...editingGoalData,
                                  targetValue: parseFloat(e.target.value) || 0
                                })}
                                data-testid={`input-goal-target-${goal.id}`}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`goal-unit-${goal.id}`}>Unit</Label>
                              <Input
                                id={`goal-unit-${goal.id}`}
                                value={editingGoalData.unit || goal.unit}
                                onChange={(e) => setEditingGoalData({
                                  ...editingGoalData,
                                  unit: e.target.value
                                })}
                                data-testid={`input-goal-unit-${goal.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`goal-priority-${goal.id}`}>Priority</Label>
                              <select
                                id={`goal-priority-${goal.id}`}
                                value={editingGoalData.priority || goal.priority}
                                onChange={(e) => setEditingGoalData({
                                  ...editingGoalData,
                                  priority: e.target.value as StrategicGoal['priority']
                                })}
                                className="w-full p-2 border rounded-md"
                                data-testid={`select-goal-priority-${goal.id}`}
                              >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingGoal(null);
                                setEditingGoalData({});
                              }}
                              data-testid={`button-cancel-goal-${goal.id}`}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                updateGoalMutation.mutate({
                                  id: goal.id,
                                  data: editingGoalData
                                });
                              }}
                              disabled={updateGoalMutation.isPending}
                              data-testid={`button-save-goal-${goal.id}`}
                            >
                              {updateGoalMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display view
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{goal.title}</h4>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingGoal(goal.id);
                                  setEditingGoalData({});
                                }}
                                data-testid={`button-edit-goal-${goal.id}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this strategic goal?')) {
                                    deleteGoalMutation.mutate(goal.id);
                                  }
                                }}
                                disabled={deleteGoalMutation.isPending}
                                data-testid={`button-delete-goal-${goal.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Element and Scorecard Relationship Flags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              OE {goalElement?.elementNumber}: {goalElement?.title}
                            </Badge>
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                            <Badge variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'secondary'}>
                              {goal.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">Current: </span>
                              <span className="font-medium">{goal.currentValue}{goal.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target: </span>
                              <span className="font-medium">{goal.targetValue}{goal.unit}</span>
                            </div>
                          </div>
                          
                          {/* Related Performance Measures */}
                          {(() => {
                            const relatedMeasures = processPerformanceMeasures.filter(measure => 
                              measure.scorecardCategory === goal.category && 
                              measure.elementId === goal.elementId
                            );
                            
                            if (relatedMeasures.length > 0) {
                              return (
                                <div className="mt-4 pt-4 border-t">
                                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Related Performance Measures</h5>
                                  <div className="space-y-2">
                                    {relatedMeasures.map((measure) => (
                                      <div key={measure.id} className="text-xs bg-muted/30 rounded p-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{measure.measureName}</span>
                                          <Badge variant="outline" className="text-xs">
                                            Process {measure.processNumber}
                                          </Badge>
                                        </div>
                                        <div className="text-muted-foreground">
                                          <span>{measure.processName}</span>
                                          {measure.target && (
                                            <span className="ml-2">• Target: {measure.target}</span>
                                          )}
                                        </div>
                                        <div className="text-muted-foreground">
                                          Scorecard: {measure.scorecardCategory}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium mb-2">No Strategic Goals</h4>
                <p className="text-muted-foreground mb-4">
                  Add strategic goals to track performance across your OE elements.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Elements and Their Scorecards */}
        <div className="space-y-8">
          {elements?.map((element) => {
            const elementGoals = getGoalsForElement(element.id);
            const elementMetrics = getMetricsForElement(element.id);
            const elementProcessMeasures = getProcessMeasuresForElement(element.id);
            
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
                              {editingMetric === metric.id ? (
                                // Edit form
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor={`metric-name-${metric.id}`}>Metric Name</Label>
                                    <Input
                                      id={`metric-name-${metric.id}`}
                                      value={editingMetricData.metricName || metric.metricName}
                                      onChange={(e) => setEditingMetricData({
                                        ...editingMetricData,
                                        metricName: e.target.value
                                      })}
                                      data-testid={`input-metric-name-${metric.id}`}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`current-value-${metric.id}`}>Current Value</Label>
                                      <Input
                                        id={`current-value-${metric.id}`}
                                        type="number"
                                        value={editingMetricData.currentValue ?? metric.currentValue}
                                        onChange={(e) => setEditingMetricData({
                                          ...editingMetricData,
                                          currentValue: parseFloat(e.target.value) || 0
                                        })}
                                        data-testid={`input-current-value-${metric.id}`}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`target-value-${metric.id}`}>Target Value</Label>
                                      <Input
                                        id={`target-value-${metric.id}`}
                                        type="number"
                                        value={editingMetricData.targetValue ?? metric.targetValue}
                                        onChange={(e) => setEditingMetricData({
                                          ...editingMetricData,
                                          targetValue: parseFloat(e.target.value) || 0
                                        })}
                                        data-testid={`input-target-value-${metric.id}`}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`unit-${metric.id}`}>Unit</Label>
                                      <Input
                                        id={`unit-${metric.id}`}
                                        value={editingMetricData.unit || metric.unit}
                                        onChange={(e) => setEditingMetricData({
                                          ...editingMetricData,
                                          unit: e.target.value
                                        })}
                                        data-testid={`input-unit-${metric.id}`}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`trend-${metric.id}`}>Trend</Label>
                                      <select
                                        id={`trend-${metric.id}`}
                                        value={editingMetricData.trend || metric.trend}
                                        onChange={(e) => setEditingMetricData({
                                          ...editingMetricData,
                                          trend: e.target.value as 'up' | 'down' | 'stable'
                                        })}
                                        className="w-full p-2 border rounded-md"
                                        data-testid={`select-trend-${metric.id}`}
                                      >
                                        <option value="up">Up</option>
                                        <option value="down">Down</option>
                                        <option value="stable">Stable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2 mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingMetric(null);
                                        setEditingMetricData({});
                                      }}
                                      data-testid={`button-cancel-edit-${metric.id}`}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const currentValue = editingMetricData.currentValue ?? metric.currentValue;
                                        const targetValue = editingMetricData.targetValue ?? metric.targetValue;
                                        const percentage = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
                                        
                                        updateMetricMutation.mutate({
                                          id: metric.id,
                                          data: {
                                            ...editingMetricData,
                                            percentage
                                          }
                                        });
                                      }}
                                      disabled={updateMetricMutation.isPending}
                                      data-testid={`button-save-edit-${metric.id}`}
                                    >
                                      {updateMetricMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Display view
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">{metric.metricName}</h4>
                                    <div className="flex items-center space-x-2">
                                      {getTrendIcon(metric.trend)}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingMetric(metric.id);
                                          setEditingMetricData({});
                                        }}
                                        data-testid={`button-edit-metric-${metric.id}`}
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                    </div>
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
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Performance Measures by Scorecard Category */}
                  {elementProcessMeasures.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Process Performance Measures
                      </h3>
                      
                      {['Financial', 'Customer', 'Internal Process', 'Learning & Growth'].map((category) => {
                        const categoryMeasures = getProcessMeasuresForElementAndCategory(element.id, category);
                        
                        if (categoryMeasures.length === 0) return null;
                        
                        return (
                          <div key={category} className="mb-6">
                            <div className="flex items-center mb-3">
                              <Badge className={`mr-2 ${getCategoryColor(category)}`}>
                                {category}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryMeasures.map((measure) => (
                                <Card key={measure.id} className="border">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-sm">{measure.measureName}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {measure.processNumber}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      From: {measure.processName}
                                    </div>
                                    {measure.target && (
                                      <div className="text-sm text-foreground">
                                        Target: {measure.target}
                                      </div>
                                    )}
                                    {measure.frequency && (
                                      <div className="text-xs text-muted-foreground">
                                        Frequency: {measure.frequency}
                                      </div>
                                    )}
                                    {measure.formula && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Formula: {measure.formula}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

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
      </main>
    </div>
  );
}