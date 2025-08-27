import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  Grid3X3
} from "lucide-react";
import type { OeElementWithProcesses } from "@shared/schema";

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
  badge 
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

type VisualizationType = 'hierarchical' | 'radial' | 'grid';

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
          {element.processes?.map((process) => (
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
              {(process as any).steps?.map((step: any, index: number) => (
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

// Clean Mind Map Style like Traditional Mind Maps
function RadialView({ elements, expandedNodes, toggleNode }: ViewProps) {
  const centerX = 600;
  const centerY = 400;
  const baseRadius = 200;

  return (
    <div className="relative min-h-[800px] w-full overflow-auto bg-white" style={{ minWidth: '1200px' }}>
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {/* Simple connection lines */}
        {elements.map((element, elementIndex) => {
          const elementAngle = (elementIndex * 2 * Math.PI) / elements.length - Math.PI / 2;
          const elementX = centerX + baseRadius * Math.cos(elementAngle);
          const elementY = centerY + baseRadius * Math.sin(elementAngle);
          
          return (
            <g key={element.id}>
              {/* Simple line from center to element */}
              <line
                x1={centerX}
                y1={centerY}
                x2={elementX}
                y2={elementY}
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Process connections */}
              {element.processes?.map((process, processIndex) => {
                if (!expandedNodes.has(element.id)) return null;
                
                const totalProcesses = element.processes?.length || 1;
                const processAngleSpread = Math.PI / 3; // 60 degrees spread
                const processAngleOffset = ((processIndex - (totalProcesses - 1) / 2) * processAngleSpread) / Math.max(totalProcesses - 1, 1);
                const processAngle = elementAngle + processAngleOffset;
                const processRadius = 120;
                const processX = elementX + processRadius * Math.cos(processAngle);
                const processY = elementY + processRadius * Math.sin(processAngle);
                
                return (
                  <g key={process.id}>
                    <line
                      x1={elementX}
                      y1={elementY}
                      x2={processX}
                      y2={processY}
                      stroke="#333"
                      strokeWidth="1.5"
                    />
                    
                    {/* Step connections */}
                    {(process as any).steps?.map((step: any, stepIndex: number) => {
                      if (!expandedNodes.has(process.id)) return null;
                      
                      const totalSteps = (process as any).steps?.length || 1;
                      const stepAngleSpread = Math.PI / 4; // 45 degrees spread
                      const stepAngleOffset = ((stepIndex - (totalSteps - 1) / 2) * stepAngleSpread) / Math.max(totalSteps - 1, 1);
                      const stepAngle = processAngle + stepAngleOffset;
                      const stepRadius = 80;
                      const stepX = processX + stepRadius * Math.cos(stepAngle);
                      const stepY = processY + stepRadius * Math.sin(stepAngle);
                      
                      return (
                        <line
                          key={step.id}
                          x1={processX}
                          y1={processY}
                          x2={stepX}
                          y2={stepY}
                          stroke="#333"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      
      {/* Center node */}
      <div className="absolute" style={{ left: `${centerX - 30}px`, top: `${centerY - 15}px`, zIndex: 20 }}>
        <div 
          className="bg-white border-2 border-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
          onClick={() => {
            // Expand all elements
            const allNodes = new Set(expandedNodes);
            elements.forEach(el => allNodes.add(el.id));
            // This would need to be handled by parent component
          }}
        >
          <span className="text-sm font-bold text-gray-800">OE Framework</span>
        </div>
      </div>
      
      {/* Element nodes with clean text labels */}
      {elements.map((element, elementIndex) => {
        const elementAngle = (elementIndex * 2 * Math.PI) / elements.length - Math.PI / 2;
        const elementX = centerX + baseRadius * Math.cos(elementAngle);
        const elementY = centerY + baseRadius * Math.sin(elementAngle);
        
        // Position text based on angle to avoid overlap
        const isRight = Math.cos(elementAngle) > 0;
        const labelX = elementX + (isRight ? 10 : -10);
        const labelY = elementY;
        
        return (
          <div key={element.id}>
            {/* Element label */}
            <div 
              className="absolute cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
              style={{ 
                left: `${labelX - (isRight ? 0 : 120)}px`, 
                top: `${labelY - 12}px`, 
                zIndex: 15,
                textAlign: isRight ? 'left' : 'right',
                minWidth: '120px'
              }}
              onClick={() => toggleNode(element.id)}
            >
              <span className="text-xs font-semibold text-blue-800">
                Element {element.elementNumber}: {element.title}
              </span>
            </div>
            
            {/* Process nodes */}
            {expandedNodes.has(element.id) && element.processes?.map((process, processIndex) => {
              const totalProcesses = element.processes?.length || 1;
              const processAngleSpread = Math.PI / 3;
              const processAngleOffset = ((processIndex - (totalProcesses - 1) / 2) * processAngleSpread) / Math.max(totalProcesses - 1, 1);
              const processAngle = elementAngle + processAngleOffset;
              const processRadius = 120;
              const processX = elementX + processRadius * Math.cos(processAngle);
              const processY = elementY + processRadius * Math.sin(processAngle);
              
              const processIsRight = Math.cos(processAngle) > 0;
              const processLabelX = processX + (processIsRight ? 10 : -10);
              
              return (
                <div key={process.id}>
                  {/* Process label */}
                  <div 
                    className="absolute cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                    style={{ 
                      left: `${processLabelX - (processIsRight ? 0 : 100)}px`, 
                      top: `${processY - 10}px`, 
                      zIndex: 15,
                      textAlign: processIsRight ? 'left' : 'right',
                      minWidth: '100px'
                    }}
                    onClick={() => toggleNode(process.id)}
                  >
                    <span className="text-xs font-medium text-green-700">
                      {process.processNumber}: {process.name}
                    </span>
                  </div>
                  
                  {/* Step nodes */}
                  {expandedNodes.has(process.id) && (process as any).steps?.map((step: any, stepIndex: number) => {
                    const totalSteps = (process as any).steps?.length || 1;
                    const stepAngleSpread = Math.PI / 4;
                    const stepAngleOffset = ((stepIndex - (totalSteps - 1) / 2) * stepAngleSpread) / Math.max(totalSteps - 1, 1);
                    const stepAngle = processAngle + stepAngleOffset;
                    const stepRadius = 80;
                    const stepX = processX + stepRadius * Math.cos(stepAngle);
                    const stepY = processY + stepRadius * Math.sin(stepAngle);
                    
                    const stepIsRight = Math.cos(stepAngle) > 0;
                    const stepLabelX = stepX + (stepIsRight ? 10 : -10);
                    
                    return (
                      <div key={step.id}>
                        {/* Step label */}
                        <div 
                          className="absolute hover:bg-gray-100 rounded px-1 py-1"
                          style={{ 
                            left: `${stepLabelX - (stepIsRight ? 0 : 80)}px`, 
                            top: `${stepY - 8}px`, 
                            zIndex: 15,
                            textAlign: stepIsRight ? 'left' : 'right',
                            minWidth: '80px'
                          }}
                        >
                          <span className="text-xs text-purple-700">
                            {step.stepNumber}: {step.stepName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
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
                {element.processes?.map((process) => (
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
                          {(process as any).steps?.map((step: any) => (
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
    queryKey: ["/api/mindmap/elements"],
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
        description: "Failed to load OE elements",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
    if (!elements) return;
    const allIds = new Set<string>();
    elements.forEach(element => {
      allIds.add(element.id);
      element.processes?.forEach(process => {
        allIds.add(process.id);
      });
    });
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  if (isLoading || elementsLoading) {
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
                  <Network className="w-8 h-8 text-primary" />
                  <span>OE Process Mind Map</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Interactive visualization of all Operational Excellence Elements, Processes, and Steps
                </p>
              </div>
              
              <div className="flex space-x-2">
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
                    onClick={() => setVisualizationType('radial')}
                    variant={visualizationType === 'radial' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8"
                  >
                    <Network className="w-4 h-4 mr-1" />
                    Radial
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
                <Button onClick={expandAll} variant="outline" size="sm">
                  Expand All
                </Button>
                <Button onClick={collapseAll} variant="outline" size="sm">
                  Collapse All
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>WSM Operational Excellence Framework</span>
                <Badge variant="secondary">
                  {elements?.length || 0} Elements
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {elements && elements.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                  {visualizationType === 'hierarchical' && (
                    <HierarchicalView 
                      elements={elements} 
                      expandedNodes={expandedNodes} 
                      toggleNode={toggleNode} 
                    />
                  )}
                  {visualizationType === 'radial' && (
                    <RadialView 
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
                  <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
                  <p className="text-muted-foreground">
                    No OE elements found. Create elements and processes to see the mind map.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}