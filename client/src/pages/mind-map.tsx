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
        className={`relative ${styles.border} ${styles.bg} border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
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
          <div className={`w-8 h-8 ${styles.accent} rounded-lg flex items-center justify-center text-white`}>
            {nodeType === 'element' && <Folder className="w-4 h-4" />}
            {nodeType === 'process' && <Activity className="w-4 h-4" />}
            {nodeType === 'step' && <Target className="w-4 h-4" />}
          </div>
          
          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-bold text-sm ${styles.text}`}>
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

// Hierarchical Tree View (Original)
function HierarchicalView({ elements, expandedNodes, toggleNode }: ViewProps) {
  return (
    <div className="space-y-6">
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

// Radial/Circular Diagram View with Curved Lines
function RadialView({ elements, expandedNodes, toggleNode }: ViewProps) {
  return (
    <div className="relative min-h-[800px] w-full overflow-auto" style={{ minWidth: '1200px' }}>
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        
        {elements.map((element, elementIndex) => {
          const centerX = 600;
          const centerY = 400;
          const elementRadius = 200;
          const elementAngle = (elementIndex * 2 * Math.PI) / elements.length;
          const elementX = centerX + elementRadius * Math.cos(elementAngle);
          const elementY = centerY + elementRadius * Math.sin(elementAngle);
          
          return (
            <g key={element.id}>
              {/* Curved line from center to element */}
              <path
                d={`M ${centerX} ${centerY} Q ${centerX + (elementX - centerX) * 0.5} ${centerY + (elementY - centerY) * 0.3} ${elementX} ${elementY}`}
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity="0.7"
              />
              
              {/* Process connections */}
              {element.processes?.map((process, processIndex) => {
                if (!expandedNodes.has(element.id)) return null;
                
                const processRadius = 120;
                const processAngle = elementAngle + (processIndex - 1) * 0.5;
                const processX = elementX + processRadius * Math.cos(processAngle);
                const processY = elementY + processRadius * Math.sin(processAngle);
                
                return (
                  <g key={process.id}>
                    <path
                      d={`M ${elementX} ${elementY} Q ${elementX + (processX - elementX) * 0.3} ${elementY + (processY - elementY) * 0.7} ${processX} ${processY}`}
                      stroke="#10b981"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      opacity="0.6"
                    />
                    
                    {/* Step connections */}
                    {(process as any).steps?.map((step: any, stepIndex: number) => {
                      if (!expandedNodes.has(process.id)) return null;
                      
                      const stepRadius = 80;
                      const stepAngle = processAngle + (stepIndex - 2) * 0.3;
                      const stepX = processX + stepRadius * Math.cos(stepAngle);
                      const stepY = processY + stepRadius * Math.sin(stepAngle);
                      
                      return (
                        <path
                          key={step.id}
                          d={`M ${processX} ${processY} Q ${processX + (stepX - processX) * 0.5} ${processY + (stepY - processY) * 0.5} ${stepX} ${stepY}`}
                          stroke="#8b5cf6"
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          opacity="0.5"
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
      <div className="absolute" style={{ left: '580px', top: '380px', zIndex: 10 }}>
        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          OE
        </div>
      </div>
      
      {/* Element nodes */}
      {elements.map((element, elementIndex) => {
        const centerX = 600;
        const centerY = 400;
        const elementRadius = 200;
        const elementAngle = (elementIndex * 2 * Math.PI) / elements.length;
        const elementX = centerX + elementRadius * Math.cos(elementAngle) - 60;
        const elementY = centerY + elementRadius * Math.sin(elementAngle) - 30;
        
        return (
          <div key={element.id} className="absolute" style={{ left: `${elementX}px`, top: `${elementY}px`, zIndex: 10 }}>
            <div 
              className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all max-w-32 text-center"
              onClick={() => toggleNode(element.id)}
            >
              <div className="flex items-center justify-center mb-1">
                <Folder className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-xs font-bold text-blue-800">#{element.elementNumber}</span>
              </div>
              <p className="text-xs text-blue-700 font-medium leading-tight">{element.title}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {element.processes?.length || 0} processes
              </Badge>
            </div>
            
            {/* Process nodes */}
            {expandedNodes.has(element.id) && element.processes?.map((process, processIndex) => {
              const processRadius = 120;
              const processAngle = elementAngle + (processIndex - 1) * 0.5;
              const processX = processRadius * Math.cos(processAngle) - 50;
              const processY = processRadius * Math.sin(processAngle) - 25;
              
              return (
                <div key={process.id} className="absolute" style={{ left: `${processX}px`, top: `${processY}px` }}>
                  <div 
                    className="bg-green-100 border-2 border-green-300 rounded-lg p-2 cursor-pointer hover:shadow-lg transition-all max-w-28 text-center"
                    onClick={() => toggleNode(process.id)}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-xs font-bold text-green-800">{process.processNumber}</span>
                    </div>
                    <p className="text-xs text-green-700 leading-tight">{process.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {(process as any).steps?.length || 0} steps
                    </Badge>
                  </div>
                  
                  {/* Step nodes */}
                  {expandedNodes.has(process.id) && (process as any).steps?.map((step: any, stepIndex: number) => {
                    const stepRadius = 80;
                    const stepAngle = processAngle + (stepIndex - 2) * 0.3;
                    const stepX = stepRadius * Math.cos(stepAngle) - 40;
                    const stepY = stepRadius * Math.sin(stepAngle) - 20;
                    
                    return (
                      <div key={step.id} className="absolute" style={{ left: `${stepX}px`, top: `${stepY}px` }}>
                        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-2 max-w-24 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Target className="w-3 h-3 text-purple-600 mr-1" />
                            <span className="text-xs font-bold text-purple-800">{step.stepNumber}</span>
                          </div>
                          <p className="text-xs text-purple-700 leading-tight">{step.stepName}</p>
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

// Grid Layout View
function GridView({ elements, expandedNodes, toggleNode }: ViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {elements.map((element) => (
        <Card key={element.id} className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle 
              className="text-base cursor-pointer flex items-center justify-between hover:text-blue-600"
              onClick={() => toggleNode(element.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {element.elementNumber}
                </div>
                <span className="text-sm">{element.title}</span>
              </div>
              {expandedNodes.has(element.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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