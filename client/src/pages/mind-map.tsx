import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Settings,
  Activity,
  Target,
  TreePine,
  Workflow,
  Grid3X3,
  Download,
  Camera,
  Flag
} from "lucide-react";
import type { OeElementWithProcesses } from "@shared/schema";
import { GoalsProcessesMindMap } from "@/components/goals-processes-mindmap";

// Numerical comparison function for version numbers
function compareVersionNumbers(a: string, b: string): number {
  const aParts = a.split('.').map(part => parseInt(part) || 0);
  const bParts = b.split('.').map(part => parseInt(part) || 0);
  
  const maxLength = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  
  return 0;
}

interface MindMapNodeProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  level: number;
  nodeType: 'element' | 'process' | 'step';
  badge?: string;
}

function MindMapNode({ 
  title, 
  subtitle, 
  children, 
  isExpanded, 
  onToggle, 
  level, 
  nodeType,
  badge,
}: MindMapNodeProps) {
  const getNodeStyle = () => {
    switch (nodeType) {
      case 'element':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          text: 'text-blue-900',
          accent: 'bg-blue-500'
        };
      case 'process':
        return {
          border: 'border-green-200', 
          bg: 'bg-green-50',
          text: 'text-green-900',
          accent: 'bg-green-500'
        };
      case 'step':
        return {
          border: 'border-purple-200',
          bg: 'bg-purple-50', 
          text: 'text-purple-900',
          accent: 'bg-purple-500'
        };
    }
  };

  const styles = getNodeStyle();
  const hasChildren = children !== undefined;

  return (
    <div className="relative">
      {/* Connection Lines */}
      {level > 0 && (
        <>
          <div 
            className="absolute left-0 top-6 w-6 border-t-2 border-gray-300"
            style={{ left: `${(level - 1) * 40 - 20}px` }}
          />
          <div 
            className="absolute top-0 border-l-2 border-gray-300"
            style={{ 
              left: `${(level - 1) * 40 - 20}px`,
              height: '24px'
            }}
          />
        </>
      )}
      
      {/* Node Card */}
      <div 
        className={`relative ${styles.border} ${styles.bg} border-2 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}
        style={{ marginLeft: `${level * 40}px` }}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-center space-x-3">
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {/* Node Icon */}
          <div className={`w-6 h-6 ${styles.accent} rounded-lg flex items-center justify-center text-white`}>
            {nodeType === 'element' && <Folder className="w-3 h-3" />}
            {nodeType === 'process' && <Activity className="w-3 h-3" />}
            {nodeType === 'step' && <Target className="w-3 h-3" />}
          </div>
          
          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-semibold text-xs ${styles.text}`}>
                {title}
              </h3>
              {badge && (
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-600 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

type VisualizationType = 'hierarchical' | 'grid';
type MindMapType = 'elements-processes' | 'goals-processes';

interface ViewProps {
  elements: OeElementWithProcesses[];
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
}

// Hierarchical Tree View with Smaller Fonts
function HierarchicalView({ elements, expandedNodes, toggleNode }: ViewProps) {
  return (
    <div className="space-y-4">
      {elements.map((element) => (
        <MindMapNode
          key={element.id}
          title={`OE Element ${element.elementNumber}: ${element.title}`}
          subtitle={element.description || undefined}
          isExpanded={expandedNodes.has(element.id)}
          onToggle={() => toggleNode(element.id)}
          level={0}
          nodeType="element"
          badge={`${element.processes?.length || 0} Processes`}

        >
          {element.processes?.sort((a, b) => compareVersionNumbers(a.processNumber, b.processNumber)).map((process) => (
            <MindMapNode
              key={process.id}
              title={`${process.processNumber}: ${process.name}`}
              subtitle={process.description || undefined}
              isExpanded={expandedNodes.has(process.id)}
              onToggle={() => toggleNode(process.id)}
              level={1}
              nodeType="process"
              badge={`${(process as any).steps?.length || 0} Steps`}
    
            >
              {(process as any).steps?.sort((a: any, b: any) => {
                const aNum = typeof a.stepNumber === 'string' ? a.stepNumber : String(a.stepNumber);
                const bNum = typeof b.stepNumber === 'string' ? b.stepNumber : String(b.stepNumber);
                return compareVersionNumbers(aNum, bNum);
              }).map((step: any, index: number) => (
                <MindMapNode
                  key={step.id}
                  title={`Step ${step.stepNumber}: ${step.stepName}`}
                  subtitle={step.stepDetails || undefined}
                  isExpanded={false}
                  onToggle={() => {}}
                  level={2}
                  nodeType="step"
        
                />
              ))}
            </MindMapNode>
          ))}
        </MindMapNode>
      ))}
    </div>
  );
}


// Grid Layout View with Smaller Fonts
function GridView({ elements, expandedNodes, toggleNode }: ViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {elements.map((element) => (
        <Card key={element.id} className="border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle 
              className="text-sm cursor-pointer flex items-center justify-between hover:text-blue-600"
              onClick={() => toggleNode(element.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {element.elementNumber}
                </div>
                <span className="text-xs">{element.title}</span>
              </div>
              {expandedNodes.has(element.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </CardTitle>
            {element.description && (
              <p className="text-xs text-muted-foreground">{element.description}</p>
            )}
          </CardHeader>
          
          {expandedNodes.has(element.id) && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {element.processes?.sort((a, b) => compareVersionNumbers(a.processNumber, b.processNumber)).map((process) => (
                  <Card key={process.id} className="border border-green-200 bg-green-50">
                    <CardContent className="p-3">
                      <div 
                        className="cursor-pointer flex items-center justify-between mb-2"
                        onClick={() => toggleNode(process.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            <Activity className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium text-green-800">{process.processNumber}</span>
                        </div>
                        {expandedNodes.has(process.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      <p className="text-xs text-green-700 mb-2">{process.name}</p>
                      
                      {expandedNodes.has(process.id) && (
                        <div className="grid grid-cols-1 gap-2">
                          {(process as any).steps?.sort((a: any, b: any) => {
                            const aNum = typeof a.stepNumber === 'string' ? a.stepNumber : String(a.stepNumber);
                            const bNum = typeof b.stepNumber === 'string' ? b.stepNumber : String(b.stepNumber);
                            return compareVersionNumbers(aNum, bNum);
                          }).map((step: any) => (
                            <div key={step.id} className="bg-white border border-purple-200 rounded p-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                  {step.stepNumber}
                                </div>
                                <span className="text-xs font-medium text-purple-800">{step.stepName}</span>
                              </div>
                              {step.stepDetails && (
                                <p className="text-xs text-purple-600 pl-7">{step.stepDetails}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function MindMap() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('hierarchical');
  const [mindMapType, setMindMapType] = useState<MindMapType>('elements-processes');
  const [isExporting, setIsExporting] = useState(false);
  const [isCapturingCanvas, setIsCapturingCanvas] = useState(false);
  
  // Reference to the goals mind map component to call its methods
  const goalsMindMapRef = useRef<any>(null);

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

  const { data: elements, isLoading: elementsLoading, error: elementsError } = useQuery<OeElementWithProcesses[]>({
    queryKey: ["/api/mindmap/elements"],
    enabled: isAuthenticated,
  });

  const { data: goalsWithProcesses, isLoading: goalsLoading, error: goalsError } = useQuery<any[]>({
    queryKey: ["/api/mindmap/goals-processes"],
    enabled: isAuthenticated,
  });

  // Handle errors
  useEffect(() => {
    const error = elementsError || goalsError;
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
        description: "Failed to load mind map data",
        variant: "destructive",
      });
    }
  }, [elementsError, goalsError, toast]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (mindMapType === 'elements-processes') {
      if (!elements) return;
      const allIds = new Set<string>();
      elements.forEach(element => {
        allIds.add(element.id);
        element.processes?.forEach(process => {
          allIds.add(process.id);
        });
      });
      setExpandedNodes(allIds);
    } else {
      // Goals-to-processes mind map
      if (!goalsWithProcesses) return;
      
      // Trigger expand all for goals mind map via ref
      if (goalsMindMapRef.current) {
        goalsMindMapRef.current.expandAll();
      }
    }
  };

  const collapseAll = () => {
    if (mindMapType === 'elements-processes') {
      setExpandedNodes(new Set());
    } else {
      // Goals-to-processes mind map
      if (goalsMindMapRef.current) {
        goalsMindMapRef.current.collapseAll();
      }
    }
  };

  const exportToPDF = async () => {
    const currentData = mindMapType === 'elements-processes' ? elements : goalsWithProcesses;
    if (!currentData || currentData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please ensure there is data to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Set up page dimensions and margins
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const leftMargin = 25;
      const rightMargin = 25;
      const topMargin = 25;
      const bottomMargin = 25;
      const maxWidth = pageWidth - (leftMargin + rightMargin);
      
      // Helper function to add justified text
      const addJustifiedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        for (let i = 0; i < lines.length; i++) {
          if (i === lines.length - 1) {
            // Last line - don't justify
            pdf.text(lines[i], x, y + (i * (fontSize * 0.35)));
          } else {
            // Justify line by adding spaces
            const words = lines[i].split(' ');
            if (words.length > 1) {
              const lineWidth = pdf.getTextWidth(lines[i]);
              const spaceWidth = (maxWidth - lineWidth) / (words.length - 1);
              let currentX = x;
              
              for (let j = 0; j < words.length; j++) {
                pdf.text(words[j], currentX, y + (i * (fontSize * 0.35)));
                if (j < words.length - 1) {
                  currentX += pdf.getTextWidth(words[j]) + pdf.getTextWidth(' ') + spaceWidth;
                }
              }
            } else {
              pdf.text(lines[i], x, y + (i * (fontSize * 0.35)));
            }
          }
        }
        return lines.length * (fontSize * 0.35);
      };

      // Helper function to check for page break and add header
      const checkPageBreak = (neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - bottomMargin) {
          pdf.addPage();
          currentY = topMargin;
          
          // Add page header (except for cover page)
          if (pdf.internal.getNumberOfPages() > 1) {
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text("WSM Operational Excellence Framework", leftMargin, 15);
            pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth - rightMargin - 15, 15);
            pdf.line(leftMargin, 18, pageWidth - rightMargin, 18);
            currentY = topMargin + 5;
          }
        }
      };

      let currentY = topMargin;

      // COVER PAGE
      pdf.setFont("helvetica");
      
      // Company Logo/Header section
      currentY = 60;
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      const mainTitle = "WSM Operational Excellence";
      pdf.text(mainTitle, pageWidth/2, currentY, { align: 'center' });
      
      currentY += 20;
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "normal");
      const subTitle = "Framework Documentation";
      pdf.text(subTitle, pageWidth/2, currentY, { align: 'center' });

      // Document title
      currentY = 140;
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      const docTitle = mindMapType === 'elements-processes' 
        ? "Mind Map Report: Elements to Processes" 
        : "Mind Map Report: Goals to Processes";
      const titleLines = pdf.splitTextToSize(docTitle, maxWidth - 40);
      for (let i = 0; i < titleLines.length; i++) {
        pdf.text(titleLines[i], pageWidth/2, currentY + (i * 24), { align: 'center' });
      }

      // Date and metadata
      currentY = 200;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const generatedDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Generated on: ${generatedDate}`, pageWidth/2, currentY, { align: 'center' });
      
      currentY += 15;
      pdf.text(`Report Type: ${mindMapType === 'elements-processes' ? 'Elements Structure' : 'Strategic Goals Alignment'}`, pageWidth/2, currentY, { align: 'center' });

      // Footer on cover page
      currentY = pageHeight - 40;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text("This document contains confidential and proprietary information", pageWidth/2, currentY, { align: 'center' });

      // Start new page for content
      pdf.addPage();
      currentY = topMargin;

      // TABLE OF CONTENTS
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("TABLE OF CONTENTS", leftMargin, currentY);
      currentY += 20;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      if (mindMapType === 'elements-processes') {
        const sortedElements = [...(elements || [])].sort((a, b) => a.elementNumber - b.elementNumber);
        for (const element of sortedElements) {
          checkPageBreak(15);
          pdf.text(`${element.elementNumber}. OE Element: ${element.title}`, leftMargin + 10, currentY);
          currentY += 12;
          
          if (element.processes && element.processes.length > 0) {
            const sortedProcesses = [...element.processes].sort((a, b) => 
              compareVersionNumbers(a.processNumber, b.processNumber)
            );
            for (const process of sortedProcesses.slice(0, 3)) { // Show first 3 processes
              pdf.text(`    ${process.processNumber}: ${process.name}`, leftMargin + 20, currentY);
              currentY += 10;
            }
            if (sortedProcesses.length > 3) {
              pdf.text(`    ... and ${sortedProcesses.length - 3} more processes`, leftMargin + 20, currentY);
              currentY += 10;
            }
          }
          currentY += 5;
        }
      } else {
        const groupedGoals = (goalsWithProcesses || []).reduce((acc: any, goal: any) => {
          const category = goal.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(goal);
          return acc;
        }, {});

        for (const [category, categoryGoals] of Object.entries(groupedGoals)) {
          checkPageBreak(15);
          pdf.text(`${category} Scorecard`, leftMargin + 10, currentY);
          currentY += 12;
          
          for (const goal of (categoryGoals as any[]).slice(0, 2)) {
            pdf.text(`    ${goal.title}`, leftMargin + 20, currentY);
            currentY += 10;
          }
          if ((categoryGoals as any[]).length > 2) {
            pdf.text(`    ... and ${(categoryGoals as any[]).length - 2} more goals`, leftMargin + 20, currentY);
            currentY += 10;
          }
          currentY += 5;
        }
      }

      // Start new page for main content
      pdf.addPage();
      currentY = topMargin;

      if (mindMapType === 'elements-processes') {
        // ELEMENTS TO PROCESSES CONTENT
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("OPERATIONAL EXCELLENCE FRAMEWORK", leftMargin, currentY);
        pdf.text("ELEMENTS TO PROCESSES MAPPING", leftMargin, currentY + 25);
        currentY += 50;

        const sortedElements = [...(elements || [])].sort((a, b) => a.elementNumber - b.elementNumber);

        for (const element of sortedElements) {
          checkPageBreak(60);

          // Chapter separator line
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.line(leftMargin, currentY - 5, pageWidth - rightMargin, currentY - 5);
          currentY += 5;

          // Element header with enhanced formatting
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(`CHAPTER ${element.elementNumber}`, leftMargin, currentY);
          currentY += 20;
          
          pdf.setFontSize(14);
          pdf.text(`OE ELEMENT: ${element.title.toUpperCase()}`, leftMargin, currentY);
          currentY += 20;

          // Element description with justified text
          if (element.description) {
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const descHeight = addJustifiedText(element.description, leftMargin, currentY, maxWidth, 11);
            currentY += descHeight + 15;
          }

          // Processes section
          if (element.processes && element.processes.length > 0) {
            checkPageBreak(30);
            
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("ASSOCIATED PROCESSES", leftMargin, currentY);
            currentY += 15;

            const sortedProcesses = [...element.processes].sort((a, b) => 
              compareVersionNumbers(a.processNumber, b.processNumber)
            );

            for (const process of sortedProcesses) {
              checkPageBreak(40);

              // Process header with indentation
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "bold");
              pdf.text(`${process.processNumber}: ${process.name}`, leftMargin + 15, currentY);
              currentY += 12;

              // Process description
              if (process.description) {
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                const procDescHeight = addJustifiedText(process.description, leftMargin + 20, currentY, maxWidth - 25, 10);
                currentY += procDescHeight + 10;
              }

              // Process steps with enhanced indentation
              if ((process as any).steps && (process as any).steps.length > 0) {
                checkPageBreak(30);
                
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "bold");
                pdf.text("Process Steps:", leftMargin + 20, currentY);
                currentY += 12;

                const sortedSteps = [...(process as any).steps].sort((a: any, b: any) => {
                  const aNum = typeof a.stepNumber === 'string' ? a.stepNumber : String(a.stepNumber);
                  const bNum = typeof b.stepNumber === 'string' ? b.stepNumber : String(b.stepNumber);
                  return compareVersionNumbers(aNum, bNum);
                });

                for (const step of sortedSteps) {
                  checkPageBreak(25);

                  pdf.setFontSize(9);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(`${step.stepNumber}. ${step.stepName}`, leftMargin + 30, currentY);
                  currentY += 10;

                  if (step.stepDetails) {
                    pdf.setFontSize(9);
                    pdf.setFont("helvetica", "normal");
                    const stepDetailHeight = addJustifiedText(step.stepDetails, leftMargin + 35, currentY, maxWidth - 40, 9);
                    currentY += stepDetailHeight + 8;
                  }
                }
              }
              currentY += 10;
            }
          }
          currentY += 20;
        }

      } else {
        // GOALS TO PROCESSES CONTENT
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("STRATEGIC GOALS FRAMEWORK", leftMargin, currentY);
        pdf.text("GOALS TO PROCESSES ALIGNMENT", leftMargin, currentY + 25);
        currentY += 50;

        const groupedGoals = (goalsWithProcesses || []).reduce((acc: any, goal: any) => {
          const category = goal.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(goal);
          return acc;
        }, {});

        for (const [category, categoryGoals] of Object.entries(groupedGoals)) {
          checkPageBreak(60);

          // Chapter separator line
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.line(leftMargin, currentY - 5, pageWidth - rightMargin, currentY - 5);
          currentY += 5;

          // Scorecard category header
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${category.toUpperCase()} SCORECARD`, leftMargin, currentY);
          currentY += 25;

          for (const goal of categoryGoals as any[]) {
            checkPageBreak(50);

            // Goal header
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text(`STRATEGIC GOAL: ${goal.title.toUpperCase()}`, leftMargin + 10, currentY);
            currentY += 18;

            // Goal description
            if (goal.description) {
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "normal");
              const descHeight = addJustifiedText(goal.description, leftMargin + 15, currentY, maxWidth - 20, 11);
              currentY += descHeight + 12;
            }

            // Performance metrics
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("Performance Metrics:", leftMargin + 15, currentY);
            currentY += 10;
            
            pdf.setFont("helvetica", "normal");
            pdf.text(`Current Progress: ${goal.currentValue}/${goal.targetValue} ${goal.unit || ''}`, leftMargin + 20, currentY);
            currentY += 8;
            
            const percentage = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0;
            pdf.text(`Achievement Rate: ${percentage}%`, leftMargin + 20, currentY);
            currentY += 15;

            // Linked processes
            if (goal.processes && goal.processes.length > 0) {
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "bold");
              pdf.text("LINKED OPERATIONAL PROCESSES", leftMargin + 15, currentY);
              currentY += 15;

              for (const process of goal.processes) {
                checkPageBreak(30);

                pdf.setFontSize(10);
                pdf.setFont("helvetica", "bold");
                pdf.text(`→ Process ${process.processNumber}: ${process.name}`, leftMargin + 25, currentY);
                currentY += 12;

                // Performance measures with formulas
                if (process.measures && process.measures.length > 0) {
                  pdf.setFontSize(9);
                  pdf.setFont("helvetica", "bold");
                  pdf.text("Performance Measures:", leftMargin + 30, currentY);
                  currentY += 10;

                  for (const measure of process.measures) {
                    pdf.setFont("helvetica", "normal");
                    pdf.text(`• ${measure.name}`, leftMargin + 35, currentY);
                    currentY += 8;
                    
                    if (measure.formula) {
                      pdf.setFontSize(8);
                      pdf.setFont("helvetica", "italic");
                      pdf.text(`Formula: ${measure.formula}`, leftMargin + 40, currentY);
                      currentY += 8;
                    }
                  }
                  currentY += 5;
                }
              }
            }
            currentY += 15;
          }
          currentY += 20;
        }
      }

      // Add final page with summary
      pdf.addPage();
      currentY = topMargin;
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("DOCUMENT SUMMARY", leftMargin, currentY);
      currentY += 25;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const summaryText = mindMapType === 'elements-processes' 
        ? `This document provides a comprehensive overview of the WSM Operational Excellence Framework, detailing the relationships between the 8 core OE elements and their associated operational processes. Each element is presented with its constituent processes, steps, and implementation guidelines to ensure systematic operational excellence across the organization.

The framework ensures alignment between strategic objectives and operational execution, providing clear pathways for continuous improvement and performance optimization. This structured approach enables organizations to maintain high standards of operational excellence while adapting to changing business requirements.

For questions or clarifications regarding this framework, please contact the Operational Excellence team.`
        : `This document presents the strategic alignment between organizational goals and operational processes within the WSM Operational Excellence Framework. The report demonstrates how strategic objectives are systematically connected to operational processes, ensuring that every process contributes meaningfully to achieving organizational goals.

The scorecard approach provides visibility into performance metrics and achievement rates, enabling data-driven decision making and continuous improvement. Each goal is linked to specific processes with measurable outcomes, creating accountability and transparency in organizational performance.

This alignment ensures that operational activities directly support strategic objectives, maximizing organizational effectiveness and competitive advantage.`;

      const summaryHeight = addJustifiedText(summaryText, leftMargin, currentY, maxWidth, 11);
      currentY += summaryHeight + 20;

      // Document metadata
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Document generated: ${new Date().toLocaleString()}`, leftMargin, currentY);
      currentY += 10;
      pdf.text(`Total pages: ${pdf.internal.getNumberOfPages()}`, leftMargin, currentY);
      pdf.text(`Document type: ${mindMapType === 'elements-processes' ? 'Elements-Processes Mapping' : 'Goals-Processes Alignment'}`, leftMargin, currentY + 10);

      // Save the PDF
      const filename = mindMapType === 'elements-processes' 
        ? 'WSM-OE-Framework-Elements-Processes.pdf' 
        : 'WSM-OE-Framework-Goals-Processes.pdf';
      pdf.save(filename);
      
      toast({
        title: "Export Successful",
        description: "Professional PDF report generated successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export mind map to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCanvasToPDF = async () => {
    const currentData = mindMapType === 'elements-processes' ? elements : goalsWithProcesses;
    if (!currentData || currentData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please ensure there is data to export",
        variant: "destructive",
      });
      return;
    }

    setIsCapturingCanvas(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Find the mind map content container with improved selectors
      let mindMapContainer = document.querySelector('[data-mindmap-content]') as HTMLElement;
      
      if (!mindMapContainer) {
        // Try finding by class
        mindMapContainer = document.querySelector('.overflow-x-auto.pb-4') as HTMLElement;
      }
      
      if (!mindMapContainer) {
        // Try the card content
        mindMapContainer = document.querySelector('[data-testid="mind-map-card"] .space-y-4, [data-testid="mind-map-card"] .grid, [data-mindmap-content="goals-processes"]') as HTMLElement;
      }
      
      if (!mindMapContainer) {
        throw new Error('Mind map content not found. Please make sure the mind map is visible.');
      }

      // Store original styles and prepare for capture
      const originalStyles = new Map();
      
      // Force visibility and ensure uniform background
      const allElements = mindMapContainer.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        originalStyles.set(htmlEl, htmlEl.style.cssText);
        
        // Ensure visibility
        htmlEl.style.opacity = '1';
        htmlEl.style.visibility = 'visible';
        htmlEl.style.display = htmlEl.style.display === 'none' ? 'block' : htmlEl.style.display;
        
        // Remove transforms that might cause issues
        htmlEl.style.transform = 'none';
        htmlEl.style.filter = 'none';
        
        // Ensure consistent backgrounds - force white background for containers
        const tagName = htmlEl.tagName.toLowerCase();
        if (['div', 'section', 'article', 'main', 'body'].includes(tagName)) {
          htmlEl.style.backgroundColor = '#ffffff';
        }
        
        // Handle cards and content areas specifically
        if (htmlEl.classList.contains('card') || htmlEl.classList.contains('bg-muted') || 
            htmlEl.classList.contains('bg-green-50') || htmlEl.classList.contains('bg-blue-50') ||
            htmlEl.classList.contains('bg-purple-50')) {
          htmlEl.style.backgroundColor = '#ffffff';
        }
      });

      // Prepare container
      const containerOriginalStyle = mindMapContainer.style.cssText;
      mindMapContainer.style.position = 'static';
      mindMapContainer.style.overflow = 'visible';
      mindMapContainer.style.height = 'auto';
      mindMapContainer.style.width = 'auto';
      mindMapContainer.style.transform = 'none';
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const options = {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // Disable for better compatibility
        logging: true, // Enable logging to debug
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc: Document) => {
          // Ensure all text and elements are visible in the clone
          const clonedElements = clonedDoc.querySelectorAll('*');
          clonedElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.opacity = '1';
            htmlEl.style.visibility = 'visible';
            htmlEl.style.color = htmlEl.style.color || '#000000';
            htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'transparent';
          });
        }
      };

      console.log('Starting canvas capture with options:', options);

      const canvas = await html2canvas(mindMapContainer, options);
      
      // Restore all original styles
      mindMapContainer.style.cssText = containerOriginalStyle;
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const originalStyle = originalStyles.get(htmlEl);
        if (originalStyle !== undefined) {
          htmlEl.style.cssText = originalStyle;
        }
      });

      console.log('Canvas created with dimensions:', canvas.width + 'x' + canvas.height);

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas capture failed - no dimensions');
      }

      // Check if canvas has content by examining pixel data
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
      const data = imageData?.data;
      
      let hasContent = false;
      if (data) {
        for (let i = 0; i < data.length; i += 4) {
          // Check if pixel is not white (255,255,255) or transparent
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 0) {
            hasContent = true;
            break;
          }
        }
      }

      if (!hasContent) {
        console.warn('Canvas appears to be blank');
        // Continue anyway, might still have content elsewhere
      }

      // Create PDF with proper sizing
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Determine optimal orientation and sizing
      const isLandscape = canvas.width > canvas.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit the page with margins
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      const scaleX = maxWidth / (canvas.width * 0.264583); // Convert px to mm
      const scaleY = maxHeight / (canvas.height * 0.264583);
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
      
      const imgWidth = (canvas.width * 0.264583) * scale;
      const imgHeight = (canvas.height * 0.264583) * scale;
      
      // Center the image
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Add header
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const title = mindMapType === 'elements-processes' 
        ? 'OE Framework Mind Map - Elements to Processes' 
        : 'OE Framework Mind Map - Goals to Processes';
      pdf.text(title + ' - ' + new Date().toLocaleDateString(), margin, margin);
      
      const mapType = mindMapType === 'elements-processes' ? 'elements-processes' : 'goals-processes';
      pdf.save(`oe-framework-mindmap-visual-${mapType}.pdf`);
      
      toast({
        title: "Visual Export Successful",
        description: "Mind map exported to PDF successfully",
      });
      
    } catch (error) {
      console.error("Canvas export error:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Export Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsCapturingCanvas(false);
    }
  };

  const isLoadingData = isLoading || elementsLoading || goalsLoading;
  const currentData = mindMapType === 'elements-processes' ? elements : goalsWithProcesses;

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="p-6">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Network className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
                <p className="text-muted-foreground">Loading mind map...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-end mb-4">
              
              <div className="flex space-x-2">
                {/* Mind Map Type Toggle */}
                <div className="flex space-x-1 border rounded-lg p-1">
                  <Button 
                    onClick={() => setMindMapType('elements-processes')}
                    variant={mindMapType === 'elements-processes' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8"
                    data-testid="tab-elements-processes"
                  >
                    <Workflow className="w-4 h-4 mr-1" />
                    Elements → Processes
                  </Button>
                  <Button 
                    onClick={() => setMindMapType('goals-processes')}
                    variant={mindMapType === 'goals-processes' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8"
                    data-testid="tab-goals-processes"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Goals → Processes
                  </Button>
                </div>
                
                {/* View Type Toggle (only for elements-processes) */}
                {mindMapType === 'elements-processes' && (
                  <div className="flex space-x-1 border rounded-lg p-1">
                    <Button 
                      onClick={() => setVisualizationType('hierarchical')}
                      variant={visualizationType === 'hierarchical' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                    >
                      <TreePine className="w-4 h-4 mr-1" />
                      Tree
                    </Button>
                    <Button 
                      onClick={() => setVisualizationType('grid')}
                      variant={visualizationType === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                    >
                      <Grid3X3 className="w-4 h-4 mr-1" />
                      Grid
                    </Button>
                  </div>
                )}
                <Button onClick={expandAll} variant="outline" size="sm">
                  Expand All
                </Button>
                <Button onClick={collapseAll} variant="outline" size="sm">
                  Collapse All
                </Button>
                <Button 
                  onClick={exportToPDF} 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting || isCapturingCanvas}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            </div>
          </div>

          <Card data-testid="mind-map-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {mindMapType === 'elements-processes' ? (
                  <>
                    <Settings className="w-5 h-5" />
                    <span>Elements to Processes Mind Map</span>
                    <Badge variant="secondary">
                      {elements?.length || 0} Elements
                    </Badge>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Goals to Processes Mind Map</span>
                    <Badge variant="secondary">
                      {goalsWithProcesses?.length || 0} Strategic Goals
                    </Badge>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mindMapType === 'elements-processes' ? (
                // Elements to Processes Mind Map
                elements && elements.length > 0 ? (
                  <div className="overflow-x-auto pb-4" data-mindmap-content>
                    {visualizationType === 'hierarchical' && (
                      <HierarchicalView 
                        elements={elements} 
                        expandedNodes={expandedNodes} 
                        toggleNode={toggleNode}
                      />
                    )}
                    {visualizationType === 'grid' && (
                      <GridView 
                        elements={elements} 
                        expandedNodes={expandedNodes} 
                        toggleNode={toggleNode}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Elements Available</h3>
                    <p className="text-muted-foreground">
                      No OE elements found. Create elements and processes to see the mind map.
                    </p>
                  </div>
                )
              ) : (
                // Goals to Processes Mind Map
                goalsWithProcesses && goalsWithProcesses.length > 0 ? (
                  <GoalsProcessesMindMap ref={goalsMindMapRef} goals={goalsWithProcesses} />
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Strategic Goals Available</h3>
                    <p className="text-muted-foreground">
                      No strategic goals with linked processes found. Create goals and link them to processes via performance measures.
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}