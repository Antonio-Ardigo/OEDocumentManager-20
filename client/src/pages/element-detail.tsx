import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Folder,
  FileText,
  Calendar,
  User,
  Activity,
  Edit,
  Download,
  BarChart3
} from "lucide-react";
import MiniProcessFlow from "@/components/mini-process-flow";
import { MindMapTree } from "@/components/mind-map-tree";
import type { OeElementWithProcesses } from "@shared/schema";

export default function ElementDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();


  const { data: element, isLoading: elementLoading, error: elementError } = useQuery<OeElementWithProcesses>({
    queryKey: ["/api/oe-elements", id],
    enabled: !!id,
  });

  // Handle element error
  useEffect(() => {
    if (elementError) {
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
    
    // Helper function to add justified text with better overflow control
    const addJustifiedText = (text: string, x: number, fontSize: number = 9, maxWidth: number = 165, indent: number = 0) => {
      doc.setFontSize(fontSize);
      const availableWidth = maxWidth - indent;
      const lines = doc.splitTextToSize(text, availableWidth);
      
      lines.forEach((line: string, index: number) => {
        // Simple left-aligned text to prevent overflow
        doc.text(line, x + indent, yPos);
        yPos += fontSize * 0.6 + 1;
      });
      
      return yPos;
    };
    
    // Helper function for chapter headings with smaller fonts
    const addChapterHeading = (title: string, level: number = 1) => {
      checkNewPage(15);
      yPos += level === 1 ? 8 : 5;
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(level === 1 ? 12 : 10);
      doc.text(title.toUpperCase(), 20, yPos);
      
      // Simple underline for main headings
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

    // Document Title Page with smaller fonts
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('OPERATIONAL EXCELLENCE ELEMENT', 105, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`ELEMENT No. ${element.elementNumber}`, 105, 65, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(element.title.toUpperCase(), 105, 80, { align: 'center' });
    
    // Document info
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 110, { align: 'center' });
    doc.text('WSM Operational Excellence Framework', 105, 120, { align: 'center' });
    
    // Simple line separator
    doc.setLineWidth(0.5);
    doc.line(50, 130, 160, 130);
    
    doc.addPage();
    yPos = 20;

    // Chapter 1: Element Overview
    addChapterHeading('1. ELEMENT OVERVIEW', 1);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    addJustifiedText(`Element Number: ${element.elementNumber}`, 20, 9);
    addJustifiedText(`Element Title: ${element.title}`, 20, 9);
    addJustifiedText(`Status: ${element.isActive ? 'Active' : 'Inactive'}`, 20, 9);
    addJustifiedText(`Total Associated Processes: ${element.processes?.length || 0}`, 20, 9);
    yPos += 3;
    
    if (element.description) {
      doc.setFont('helvetica', 'bold');
      addJustifiedText('Description:', 20, 9);
      doc.setFont('helvetica', 'normal');
      addJustifiedText(element.description, 20, 9);
      yPos += 3;
    }
    
    if (element.createdAt || element.updatedAt) {
      doc.setFont('helvetica', 'bold');
      addJustifiedText('Timeline Information:', 20, 9);
      doc.setFont('helvetica', 'normal');
      
      if (element.createdAt) {
        addJustifiedText(`Created: ${new Date(element.createdAt).toLocaleDateString()}`, 20, 9);
      }
      if (element.updatedAt) {
        addJustifiedText(`Last Updated: ${new Date(element.updatedAt).toLocaleDateString()}`, 20, 9);
      }
      yPos += 5;
    }

    // Chapter 2: Associated Processes
    if (element.processes && element.processes.length > 0) {
      addChapterHeading('2. ASSOCIATED PROCESSES', 1);
      
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`This element contains ${element.processes.length} associated processes that define the operational procedures and standards. Each process includes detailed steps, responsibilities, and performance measures to ensure consistent execution and continuous improvement.`, 20, 9);
      yPos += 5;
      
      element.processes.forEach((process, index) => {
        checkNewPage(40);
        
        // Process subheading
        addChapterHeading(`2.${index + 1} ${process.processNumber}: ${process.name}`, 2);
        
        // Process details
        doc.setFont('helvetica', 'bold');
        addJustifiedText('Process Information:', 20, 9);
        
        doc.setFont('helvetica', 'normal');
        addJustifiedText(`Process Number: ${process.processNumber}`, 25, 8, 165, 5);
        addJustifiedText(`Process Name: ${process.name}`, 25, 8, 165, 5);
        addJustifiedText(`Status: ${process.status || 'Draft'}`, 25, 8, 165, 5);
        addJustifiedText(`Revision: ${process.revision || 1}`, 25, 8, 165, 5);
        
        if (process.processOwner) {
          addJustifiedText(`Process Owner: ${process.processOwner}`, 25, 8, 165, 5);
        }
        
        if (process.issueDate) {
          addJustifiedText(`Issue Date: ${new Date(process.issueDate).toLocaleDateString()}`, 25, 8, 165, 5);
        }
        
        yPos += 3;
        
        // Process description
        if (process.description) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Process Description:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.description, 25, 8, 165, 5);
          yPos += 3;
        }
        
        // Expectations
        if (process.expectations) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Expectations:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.expectations, 25, 8, 165, 5);
          yPos += 3;
        }
        
        // Responsibilities
        if (process.responsibilities) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Responsibilities:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.responsibilities, 25, 8, 165, 5);
          yPos += 3;
        }
        
        // Detailed Process Steps (Individual Steps)
        if (process.steps && process.steps.length > 0) {
          checkNewPage(30);
          doc.setFont('helvetica', 'bold');
          addJustifiedText(`Detailed Process Steps (${process.steps.length} steps):`, 20, 9);
          yPos += 2;
          
          process.steps.forEach((step) => {
            checkNewPage(25);
            
            doc.setFont('helvetica', 'bold');
            addJustifiedText(`Step ${step.stepNumber}: ${step.stepName}`, 25, 8, 165, 5);
            
            doc.setFont('helvetica', 'normal');
            
            if (step.stepDetails) {
              addJustifiedText(`Details: ${step.stepDetails}`, 30, 8, 165, 10);
            }
            
            if (step.responsibilities) {
              addJustifiedText(`Responsibilities: ${step.responsibilities}`, 30, 8, 165, 10);
            }
            
            if (step.references) {
              addJustifiedText(`References: ${step.references}`, 30, 8, 165, 10);
            }
            
            yPos += 2;
          });
          yPos += 3;
        }
        
        // Process Steps Content (General content)
        if (process.processStepsContent) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Process Steps Overview:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.processStepsContent, 25, 8, 165, 5);
          yPos += 3;
        }
        
        // Performance Measures Overview
        if (process.performanceMeasureContent) {
          checkNewPage(20);
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Performance Measures Overview:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.performanceMeasureContent, 25, 8, 165, 5);
          yPos += 3;
        }

        // Individual Performance Measures
        if (process.performanceMeasures && process.performanceMeasures.length > 0) {
          checkNewPage(30);
          doc.setFont('helvetica', 'bold');
          addJustifiedText(`Performance Measures (${process.performanceMeasures.length} measures):`, 20, 9);
          yPos += 2;
          
          process.performanceMeasures.forEach((measure, measureIndex) => {
            checkNewPage(20);
            
            doc.setFont('helvetica', 'bold');
            addJustifiedText(`${measureIndex + 1}. ${measure.measureName}`, 25, 8, 165, 5);
            
            doc.setFont('helvetica', 'normal');
            
            if (measure.formula) {
              addJustifiedText(`Formula: ${measure.formula}`, 30, 8, 165, 10);
            }
            
            if (measure.target) {
              addJustifiedText(`Target: ${measure.target}`, 30, 8, 165, 10);
            }
            
            if (measure.frequency) {
              addJustifiedText(`Frequency: ${measure.frequency}`, 30, 8, 165, 10);
            }
            
            if (measure.source) {
              addJustifiedText(`Source: ${measure.source}`, 30, 8, 165, 10);
            }
            
            yPos += 2;
          });
          yPos += 3;
        }
        
        // Additional process fields
        if (process.processFlowContent) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Process Flow:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.processFlowContent, 25, 8, 165, 5);
          yPos += 3;
        }
        
        if (process.resourceRequirements) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Resource Requirements:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.resourceRequirements, 25, 8, 165, 5);
          yPos += 3;
        }
        
        if (process.riskConsiderations) {
          doc.setFont('helvetica', 'bold');
          addJustifiedText('Risk Considerations:', 20, 9);
          doc.setFont('helvetica', 'normal');
          addJustifiedText(process.riskConsiderations, 25, 8, 165, 5);
          yPos += 3;
        }
        
        yPos += 8; // Reduced space between processes
      });
    }

    // Footer for all pages
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Simple footer line
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 285, 190, 285);
      
      // Footer text
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`OE Element ${element.elementNumber} - ${element.title}`, 20, 292);
      doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 292, { align: 'center' });
    }

    // Save the PDF
    doc.save(`OE-Element-${element.elementNumber}-${element.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    
    toast({
      title: "Export Successful",
      description: "Element report has been exported as PDF",
    });
  };

  if (elementLoading) {
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl bg-muted">
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

              {/* Enabling Elements Display - Enhanced Visual Design */}
              {element.enablingElements && element.enablingElements.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">⚡</span>
                        </div>
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Enabling Elements
                        </div>
                        <div className="ml-auto">
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {element.enablingElements.length} Element{element.enablingElements.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {element.enablingElements.map((enabledElement: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="default"
                            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0 shadow-sm transition-colors duration-200"
                            data-testid={`enabling-element-${index}`}
                          >
                            <span className="mr-1">🔹</span>
                            {enabledElement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {/* Performance Measurements Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Performance Measurements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {element.processes && element.processes.length > 0 ? (
                    <div className="space-y-6">
                      {element.processes.map((process) => (
                        <div key={process.id} className="border-l-4 border-primary/20 pl-4">
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg flex items-center space-x-2">
                              <Activity className="w-5 h-5 text-primary" />
                              <span>{process.processNumber}: {process.name}</span>
                            </h3>
                          </div>
                          
                          {(process as any).performanceMeasures && (process as any).performanceMeasures.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full border border-border rounded-lg">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 font-semibold text-sm">#</th>
                                    <th className="text-left p-3 font-semibold text-sm">Measure Name</th>
                                    <th className="text-left p-3 font-semibold text-sm">Target</th>
                                    <th className="text-left p-3 font-semibold text-sm">Formula</th>
                                    <th className="text-left p-3 font-semibold text-sm">Frequency</th>
                                    <th className="text-left p-3 font-semibold text-sm">Source</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(process as any).performanceMeasures.map((measure: any, index: number) => (
                                    <tr key={measure.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                      <td className="p-3 text-sm font-medium text-primary">{index + 1}</td>
                                      <td className="p-3 text-sm font-medium">{measure.measureName}</td>
                                      <td className="p-3">
                                        {measure.target && (
                                          <Badge variant="outline" className="text-xs">
                                            {measure.target}
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground max-w-xs">
                                        <div className="truncate" title={measure.formula}>
                                          {measure.formula || '-'}
                                        </div>
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground">
                                        {measure.frequency || '-'}
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground max-w-xs">
                                        <div className="truncate" title={measure.source}>
                                          {measure.source || '-'}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No performance measures defined</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Performance Data</h3>
                      <p>Performance measurements will be available once processes are created.</p>
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