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

    // Add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(45, 55, 72);
    addText(`OE Element No. ${element.elementNumber}: ${element.title}`, 20, 20);
    
    yPos += 5;
    doc.setLineWidth(2);
    doc.setDrawColor(59, 130, 246);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    // Element Overview
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(45, 55, 72);
    addText('Element Overview', 20, 16);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    if (element.description) {
      addText(`Description: ${element.description}`, 20, 12);
    }
    
    addText(`Status: ${element.isActive ? 'Active' : 'Inactive'}`, 20, 12);
    addText(`Total Processes: ${element.processes?.length || 0}`, 20, 12);
    
    if (element.createdAt) {
      addText(`Created: ${new Date(element.createdAt).toLocaleDateString()}`, 20, 12);
    }
    if (element.updatedAt) {
      addText(`Last Updated: ${new Date(element.updatedAt).toLocaleDateString()}`, 20, 12);
    }
    
    yPos += 10;

    // Processes Section
    if (element.processes && element.processes.length > 0) {
      checkNewPage(50);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(45, 55, 72);
      addText('Associated Processes', 20, 16);
      
      element.processes.forEach((process, index) => {
        checkNewPage(60);
        
        // Process header with colored background
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.roundedRect(20, yPos - 5, 170, 25, 3, 3, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(45, 55, 72);
        addText(`${process.processNumber}: ${process.name}`, 25, 14);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        if (process.description) {
          addText(`Description: ${process.description}`, 25, 12);
        }
        
        addText(`Status: ${process.status || 'Draft'}`, 25, 12);
        addText(`Revision: ${process.revision || 1}`, 25, 12);
        
        if (process.processOwner) {
          addText(`Process Owner: ${process.processOwner}`, 25, 12);
        }
        
        if (process.steps && process.steps.length > 0) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          addText(`Process Steps (${process.steps.length}):`, 25, 12);
          doc.setFont('helvetica', 'normal');
          
          process.steps.forEach((step) => {
            checkNewPage(20);
            addText(`${step.stepNumber}. ${step.stepName}`, 30, 11, 160);
            if (step.stepDetails) {
              doc.setFontSize(10);
              doc.setTextColor(100, 100, 100);
              addText(`   ${step.stepDetails}`, 30, 10, 160);
              doc.setFontSize(12);
              doc.setTextColor(45, 55, 72);
            }
          });
        }
        
        yPos += 10;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 20, 290);
      doc.text('WSM Operational Excellence Framework', 190 - 50, 290);
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