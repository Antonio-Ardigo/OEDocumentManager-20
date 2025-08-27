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
  Target
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

export default function MindMap() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
    queryKey: ["/api/oe-elements/mindmap"],
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
                <div className="space-y-6 overflow-x-auto pb-4">
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