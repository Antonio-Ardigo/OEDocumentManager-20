import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  ArrowLeft,
  Plus,
  Folder,
  FileText,
  Calendar,
  User,
  Activity,
  Edit,
  Download
} from "lucide-react";
import MiniProcessFlow from "@/components/mini-process-flow";
import { MindMapTree } from "@/components/mind-map-tree";
import type { OeElementWithProcesses } from "@shared/schema";

export default function ElementDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: element, isLoading: elementLoading, error: elementError } = useQuery<OeElementWithProcesses>({
    queryKey: ["/api/oe-elements", id],
    enabled: isAuthenticated && !!id,
  });

  // Handle element error
  useEffect(() => {
    if (elementError) {
      if (isUnauthorizedError(elementError)) {
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
        description: "Failed to load element details",
        variant: "destructive",
      });
    }
  }, [elementError, toast]);

  const handleExportPDF = async () => {
    if (!element) return;
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let yPos = 20;
    
    // Helper function to add text and return new Y position
    const addText = (text: string, x: number, fontSize: number = 12, maxWidth: number = 170) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, yPos);
      yPos += lines.length * (fontSize * 0.5) + 5;
      return yPos;
    };
    
    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace: number = 30) => {
      if (yPos + requiredSpace > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Enhanced header with professional branding
    const addProfessionalHeader = () => {
      // Background gradient effect
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Company/Framework branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('WSM OPERATIONAL EXCELLENCE FRAMEWORK', 20, 15);
      
      // Main title with enhanced styling
      doc.setFontSize(18);
      doc.text(`OE ELEMENT No. ${element.elementNumber}`, 20, 28);
      
      // Element title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const titleText = element.title.toUpperCase();
      doc.text(titleText, 20, 40);
      
      // Decorative line
      doc.setLineWidth(2);
      doc.setDrawColor(255, 255, 255);
      doc.line(20, 45, 190, 45);
      
      yPos = 60;
    };

    addProfessionalHeader();

    // Enhanced Element Overview with visual info boxes
    const addInfoBox = (title: string, content: string, color: [number, number, number]) => {
      checkNewPage(25);
      
      // Info box background
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(20, yPos - 3, 170, 20, 3, 3, 'F');
      
      // White text for title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, 25, yPos + 8);
      
      // Content text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(content, 25, yPos + 15);
      
      yPos += 25;
    };

    // Section header
    doc.setTextColor(45, 55, 72);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    addText('ELEMENT OVERVIEW', 20, 18);
    
    yPos += 10;

    // Status and key metrics with color-coded info boxes
    addInfoBox('STATUS', element.isActive ? 'ACTIVE ✓' : 'INACTIVE ✗', 
               element.isActive ? [34, 197, 94] : [239, 68, 68]);
    
    addInfoBox('TOTAL PROCESSES', `${element.processes?.length || 0} Processes Defined`, [59, 130, 246]);
    
    if (element.description) {
      // Description in a larger box
      checkNewPage(40);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.roundedRect(20, yPos - 3, 170, 35, 3, 3, 'FD');
      
      doc.setTextColor(45, 55, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('DESCRIPTION', 25, yPos + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(element.description, 160);
      doc.text(descLines, 25, yPos + 18);
      
      yPos += 45;
    }
    
    // Timeline info
    if (element.createdAt || element.updatedAt) {
      checkNewPage(30);
      doc.setFillColor(124, 58, 237);
      doc.roundedRect(20, yPos - 3, 170, 25, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TIMELINE', 25, yPos + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let timelineText = '';
      if (element.createdAt) {
        timelineText += `Created: ${new Date(element.createdAt).toLocaleDateString()}`;
      }
      if (element.updatedAt) {
        if (timelineText) timelineText += ' | ';
        timelineText += `Last Updated: ${new Date(element.updatedAt).toLocaleDateString()}`;
      }
      doc.text(timelineText, 25, yPos + 18);
      
      yPos += 35;
    }

    // Enhanced Processes Section with visual charts
    if (element.processes && element.processes.length > 0) {
      checkNewPage(80);
      
      // Section header with decorative styling
      doc.setFillColor(45, 55, 72);
      doc.rect(20, yPos - 5, 170, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('ASSOCIATED PROCESSES', 25, yPos + 8);
      yPos += 35;
      
      // Process statistics chart
      const processStats = {
        active: element.processes.filter(p => p.status === 'active').length,
        draft: element.processes.filter(p => p.status === 'draft').length,
        review: element.processes.filter(p => p.status === 'review').length,
        archived: element.processes.filter(p => p.status === 'archived').length,
      };
      
      // Draw process status chart
      checkNewPage(80);
      doc.setTextColor(45, 55, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PROCESS STATUS OVERVIEW', 20, yPos + 10);
      
      let chartX = 20;
      const chartY = yPos + 20;
      const barWidth = 35;
      const maxBarHeight = 40;
      const totalProcesses = element.processes.length;
      
      const statusColors = {
        active: [34, 197, 94],
        draft: [156, 163, 175],
        review: [251, 191, 36],
        archived: [239, 68, 68]
      };
      
      Object.entries(processStats).forEach(([status, count]) => {
        if (count > 0) {
          const barHeight = Math.max((count / totalProcesses) * maxBarHeight, 5);
          
          // Draw bar
          const color = statusColors[status as keyof typeof statusColors];
          doc.setFillColor(color[0], color[1], color[2]);
          doc.roundedRect(chartX, chartY + maxBarHeight - barHeight, barWidth, barHeight, 2, 2, 'F');
          
          // Draw count on top
          doc.setTextColor(45, 55, 72);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(count.toString(), chartX + barWidth/2 - 3, chartY + maxBarHeight - barHeight - 5);
          
          // Draw status label
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(status.toUpperCase(), chartX, chartY + maxBarHeight + 10);
          
          chartX += barWidth + 10;
        }
      });
      
      yPos = chartY + maxBarHeight + 25;
      
      // Individual process cards with enhanced design
      element.processes.forEach((process, index) => {
        checkNewPage(100);
        
        // Process card with gradient effect
        const cardColors = {
          active: [34, 197, 94],
          draft: [156, 163, 175], 
          review: [251, 191, 36],
          archived: [239, 68, 68]
        };
        
        const statusColor = cardColors[process.status as keyof typeof cardColors] || [59, 130, 246];
        
        // Card shadow effect
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(22, yPos + 2, 170, 35, 5, 5, 'F');
        
        // Main card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setLineWidth(2);
        doc.roundedRect(20, yPos, 170, 35, 5, 5, 'FD');
        
        // Status indicator stripe
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.roundedRect(20, yPos, 8, 35, 5, 5, 'F');
        
        // Process header
        doc.setTextColor(45, 55, 72);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${process.processNumber}`, 35, yPos + 12);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const processTitle = doc.splitTextToSize(process.name, 120);
        doc.text(processTitle, 35, yPos + 22);
        
        // Status badge
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.roundedRect(150, yPos + 5, 35, 12, 6, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text((process.status || 'DRAFT').toUpperCase(), 155, yPos + 12);
        
        // Process owner
        if (process.processOwner) {
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Owner: ${process.processOwner}`, 35, yPos + 30);
        }
        
        yPos += 45;
        
        // Note: Process steps would be displayed here if available
        // For now, we'll show a placeholder indicating steps exist
        yPos += 10;
        
        yPos += 15; // Space between processes
      });
    }

    // Enhanced Footer with professional styling  
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 285, 210, 12, 'F');
      
      // Footer line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(20, 285, 190, 285);
      
      // Footer text
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Generated ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`, 20, 292);
      doc.text('WSM Operational Excellence Framework', 140, 292);
      
      // Decorative element
      doc.setFillColor(59, 130, 246);
      doc.circle(200, 291, 2, 'F');
    }

    // Save the PDF
    doc.save(`OE-Element-${element.elementNumber}-${element.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    
    toast({
      title: "Export Successful",
      description: "Element report has been exported as PDF",
    });
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (elementLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
              <div className="h-6 bg-muted rounded mb-6 w-1/2"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="p-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Element Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The requested OE element could not be found or you don't have permission to view it.
                </p>
                <Button asChild data-testid="button-back-to-dashboard">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild data-testid="button-back">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: element.color || '#3B82F6' }}>
                    {element.icon}
                  </div>
                  <h1 className="text-2xl font-bold" data-testid="element-title">
                    OE Element No. {element.elementNumber}: {element.title}
                  </h1>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span data-testid="element-processes-count">
                    {element.processes?.length || 0} Process{(element.processes?.length || 0) !== 1 ? 'es' : ''}
                  </span>
                  <span>•</span>
                  <Badge variant={element.isActive ? "default" : "secondary"} data-testid="element-status">
                    {element.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild data-testid="button-edit-element">
                <Link href={`/element/${element.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Element
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" asChild data-testid="button-create-process">
                <Link href={`/create-process?elementId=${element.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Process
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Element Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Folder className="w-5 h-5" />
                    <span>Element Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {element.description ? (
                    <p className="text-muted-foreground mb-6" data-testid="element-description">
                      {element.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic mb-6">No description available.</p>
                  )}
                  
                  {/* Mind Map Tree */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Process Mind Map</span>
                    </h3>
                    <MindMapTree 
                      processes={element.processes?.map(process => ({
                        id: process.id,
                        processNumber: process.processNumber,
                        name: process.name,
                        steps: (process as any).steps?.map((step: any) => ({
                          id: step.id,
                          stepNumber: step.stepNumber,
                          stepName: step.stepName,
                          stepDetails: step.stepDetails
                        })) || []
                      })) || []}
                      elementTitle={element.title}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Associated Processes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Associated Processes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {element.processes && element.processes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {element.processes.map((process) => (
                        <Card key={process.id} className="cursor-pointer transition-all duration-200 hover:shadow-md" data-testid={`process-card-${process.id}`}>
                          <Link href={`/process/${process.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm">{process.name}</h3>
                                    <p className="text-xs text-muted-foreground">{process.processNumber}</p>
                                  </div>
                                </div>
                                <Badge className={getStatusColor(process.status || 'draft')}>
                                  {process.status || 'draft'}
                                </Badge>
                              </div>
                              
                              {process.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {process.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                <div className="flex items-center space-x-4">
                                  {process.processOwner && (
                                    <div className="flex items-center space-x-1">
                                      <User className="w-3 h-3" />
                                      <span>{process.processOwner}</span>
                                    </div>
                                  )}
                                  {process.updatedAt && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(process.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {process.isMandatory && (
                                  <div className="flex items-center space-x-1 text-primary">
                                    <Activity className="w-3 h-3" />
                                    <span className="text-xs font-medium">Mandatory</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Mini Process Flow */}
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <MiniProcessFlow 
                                  processNumber={process.processNumber}
                                  steps={[]}
                                  compact={true}
                                />
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Processes Yet</h3>
                      <p className="mb-4">This element doesn't have any processes defined yet.</p>
                      <Button asChild>
                        <Link href={`/create-process?elementId=${element.id}`}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Process
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Element Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Element Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Element Number</dt>
                    <dd className="mt-1 text-sm" data-testid="element-number">{element.elementNumber}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={element.isActive ? "default" : "secondary"}>
                        {element.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Total Processes</dt>
                    <dd className="mt-1 text-sm" data-testid="element-process-count">
                      {element.processes?.length || 0}
                    </dd>
                  </div>

                  {element.createdAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                      <dd className="mt-1 text-sm" data-testid="element-created-date">
                        {new Date(element.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}

                  {element.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1 text-sm" data-testid="element-updated-date">
                        {new Date(element.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}