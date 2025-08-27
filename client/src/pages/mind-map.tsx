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
  Grid3X3,
  Download,
  Camera
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

type VisualizationType = 'hierarchical' | 'grid';

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
          {element.processes?.sort((a, b) => a.processNumber.localeCompare(b.processNumber)).map((process) => (
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
                return aNum.localeCompare(bNum);
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
                {element.processes?.sort((a, b) => a.processNumber.localeCompare(b.processNumber)).map((process) => (
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
                            return aNum.localeCompare(bNum);
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
  const [isExporting, setIsExporting] = useState(false);
  const [isCapturingCanvas, setIsCapturingCanvas] = useState(false);

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

  const exportToPDF = async () => {
    if (!elements || elements.length === 0) {
      toast({
        title: "No data to export",
        description: "Please ensure there are elements to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Set up fonts and styling
      pdf.setFont("helvetica");
      let currentY = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("OE Framework Mind Map", margin, currentY);
      currentY += 15;

      // Date
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, currentY);
      currentY += 20;

      // Process elements in order
      const sortedElements = [...elements].sort((a, b) => a.elementNumber - b.elementNumber);

      for (const element of sortedElements) {
        // Check for page break
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = 20;
        }

        // Element header
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`OE Element ${element.elementNumber}: ${element.title}`, margin, currentY);
        currentY += 10;

        if (element.description) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          const descLines = pdf.splitTextToSize(element.description, maxWidth);
          pdf.text(descLines, margin, currentY);
          currentY += (descLines.length * 4) + 5;
        }

        // Processes
        if (element.processes && element.processes.length > 0) {
          const sortedProcesses = [...element.processes].sort((a, b) => 
            a.processNumber.localeCompare(b.processNumber)
          );

          for (const process of sortedProcesses) {
            // Check for page break
            if (currentY > pageHeight - 30) {
              pdf.addPage();
              currentY = 20;
            }

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text(`  ${process.processNumber}: ${process.name}`, margin + 10, currentY);
            currentY += 8;

            if (process.description) {
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "normal");
              const procDescLines = pdf.splitTextToSize(process.description, maxWidth - 20);
              pdf.text(procDescLines, margin + 15, currentY);
              currentY += (procDescLines.length * 3) + 3;
            }

            // Steps
            if ((process as any).steps && (process as any).steps.length > 0) {
              const sortedSteps = [...(process as any).steps].sort((a: any, b: any) => {
                const aNum = typeof a.stepNumber === 'string' ? a.stepNumber : String(a.stepNumber);
                const bNum = typeof b.stepNumber === 'string' ? b.stepNumber : String(b.stepNumber);
                return aNum.localeCompare(bNum);
              });

              for (const step of sortedSteps) {
                // Check for page break
                if (currentY > pageHeight - 20) {
                  pdf.addPage();
                  currentY = 20;
                }

                pdf.setFontSize(9);
                pdf.setFont("helvetica", "bold");
                pdf.text(`    Step ${step.stepNumber}: ${step.stepName}`, margin + 20, currentY);
                currentY += 6;

                if (step.stepDetails) {
                  pdf.setFontSize(8);
                  pdf.setFont("helvetica", "normal");
                  const stepDetailLines = pdf.splitTextToSize(step.stepDetails, maxWidth - 30);
                  pdf.text(stepDetailLines, margin + 25, currentY);
                  currentY += (stepDetailLines.length * 3) + 2;
                }
                currentY += 2;
              }
            }
            currentY += 5;
          }
        }
        currentY += 10;
      }

      // Save the PDF
      pdf.save('oe-framework-mindmap.pdf');
      
      toast({
        title: "Export Successful",
        description: "Mind map exported to PDF successfully",
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
    if (!elements || elements.length === 0) {
      toast({
        title: "No data to export",
        description: "Please ensure there are elements to export",
        variant: "destructive",
      });
      return;
    }

    setIsCapturingCanvas(true);
    
    try {
      // Try to use the browser's built-in print to PDF as fallback
      if (window.print) {
        // Create a new window with just the mind map content
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Unable to open print window');
        }

        const mindMapContainer = document.querySelector('[data-mindmap-content]');
        if (!mindMapContainer) {
          throw new Error('Mind map content not found');
        }

        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OE Framework Mind Map</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: white;
                padding: 20px;
                color: black;
              }
              .mind-map-export { 
                max-width: 100%;
                overflow: visible;
              }
              .mind-map-export * {
                background: transparent !important;
                color: black !important;
                border-color: #ccc !important;
              }
              @media print {
                body { margin: 0; }
                .mind-map-export { 
                  transform: scale(0.8);
                  transform-origin: top left;
                }
              }
            </style>
          </head>
          <body>
            <h1>OE Framework Mind Map</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <br>
            <div class="mind-map-export">
              ${mindMapContainer.innerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }, 500);
              };
            </script>
          </body>
          </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        toast({
          title: "Print Dialog Opened",
          description: "Use your browser's print dialog to save as PDF",
        });
      } else {
        throw new Error('Print functionality not available');
      }
    } catch (error) {
      console.error("Error exporting canvas:", error);
      
      // Fallback: provide instructions for manual screenshot
      toast({
        title: "Manual Export Required",
        description: "Please use your browser's screenshot tool or print function to capture the mind map",
        variant: "destructive",
      });
    } finally {
      setIsCapturingCanvas(false);
    }
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
                <Button 
                  onClick={exportToPDF} 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting || isCapturingCanvas}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export Text PDF'}
                </Button>
                <Button 
                  onClick={exportCanvasToPDF} 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting || isCapturingCanvas}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {isCapturingCanvas ? 'Capturing...' : 'Export Visual PDF'}
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