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
  Edit3,
  Download,
  History,
  User,
  Calendar,
  FileText,
  Target,
  BarChart3,
  ArrowLeft,
  Star
} from "lucide-react";
import ProcessFlowDiagram from "@/components/process-flow-diagram";
import ProcessContentSections from "@/components/process-content-sections";
import type { OeProcessWithDetails } from "@shared/schema";

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // PDF Export functionality
  const handleExportPDF = async () => {
    if (!process) return;
    
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

    // Draw process flow diagram box
    const drawProcessFlowBox = (step: any, x: number, y: number, width: number = 50, height: number = 30) => {
      // Draw box
      doc.setDrawColor(59, 130, 246); // Blue color
      doc.setFillColor(239, 246, 255); // Light blue fill
      doc.roundedRect(x, y, width, height, 3, 3, 'FD');
      
      // Add step number circle
      doc.setFillColor(59, 130, 246);
      doc.circle(x + 8, y + 8, 5, 'F');
      
      // Add step number text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(step.stepNumber.toString(), x + 6, y + 10);
      
      // Add step name
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      const stepName = step.stepName.length > 12 ? step.stepName.substring(0, 12) + '...' : step.stepName;
      doc.text(stepName, x + 2, y + 20);
    };

    // Draw arrow between boxes
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.line(fromX, fromY, toX, toY);
      
      // Arrow head
      const headSize = 3;
      doc.line(toX - headSize, toY - headSize, toX, toY);
      doc.line(toX - headSize, toY + headSize, toX, toY);
    };
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    addText(`WSM Operational Excellence Process`, 20, 20);
    
    doc.setFontSize(16);
    addText(`${process.name}`, 20, 16);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    addText(`Process Number: ${process.processNumber}`, 20, 12);
    addText(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 12);
    
    yPos += 10;
    
    // Process Flow Diagram - Visual representation
    checkNewPage(80);
    doc.setFont('helvetica', 'bold');
    addText('PROCESS FLOW DIAGRAM', 20, 14);
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    // Draw visual flow diagram
    if (process.steps && process.steps.length > 0) {
      const boxWidth = 50;
      const boxHeight = 30;
      const spacing = 15;
      const startX = 20;
      const flowY = yPos;
      
      process.steps.forEach((step, index) => {
        const x = startX + (index * (boxWidth + spacing));
        drawProcessFlowBox(step, x, flowY, boxWidth, boxHeight);
        
        // Draw arrow to next box
        if (index < process.steps.length - 1) {
          drawArrow(x + boxWidth, flowY + boxHeight/2, x + boxWidth + spacing, flowY + boxHeight/2);
        }
      });
      
      yPos += boxHeight + 20;
    }
    
    // Process summary text
    const flowText = process.steps?.map((step, index) => {
      const arrow = index < process.steps.length - 1 ? ' → ' : '';
      return `[${step.stepNumber}] ${step.stepName}${arrow}`;
    }).join('') || '';
    
    addText(`Flow Summary: ${flowText}`, 20, 10, 170);
    
    // Process steps details
    if (process.steps && process.steps.length > 0) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      addText('DETAILED PROCESS STEPS', 20, 12);
      doc.setFont('helvetica', 'normal');
      
      process.steps.forEach((step, index) => {
        checkNewPage(40);
        doc.setFont('helvetica', 'bold');
        addText(`Step ${step.stepNumber}: ${step.stepName}`, 25, 11);
        doc.setFont('helvetica', 'normal');
        
        if (step.stepDetails) {
          addText(`Details: ${step.stepDetails}`, 30, 10, 160);
        }
        if (step.responsibilities) {
          addText(`Responsibilities: ${step.responsibilities}`, 30, 10, 160);
        }
        if (step.references) {
          addText(`References: ${step.references}`, 30, 10, 160);
        }
        yPos += 5;
      });
    }
    
    // TABLE OF CONTENTS sections
    yPos += 10;
    checkNewPage(40);
    doc.setFont('helvetica', 'bold');
    addText('TABLE OF CONTENTS', 20, 16);
    doc.setFont('helvetica', 'normal');
    
    // 1. EXPECTATIONS
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    addText('1. EXPECTATIONS', 20, 12);
    doc.setFont('helvetica', 'normal');
    const expectationsContent = process.processNumber === 'OE-4.1' 
      ? `Asset Management Design & Procurement process is expected to deliver:
• Optimized asset performance through effective design and procurement strategies
• Cost-effective procurement decisions that balance quality, cost, and delivery requirements
• Quality construction delivery meeting all specifications and standards
• Smooth operational handover with proper documentation and training

Key Performance Expectations:
- All procurement activities must comply with WSM procurement policies and procedures
- Design specifications must meet operational requirements and safety standards
- Construction quality must achieve planned asset reliability and availability targets
- Handover documentation must be complete and accurate for operational readiness`
      : process.processNumber === 'OE-4.2'
      ? `Asset Management Operations & Maintenance process is expected to deliver:
• Maximum asset uptime through proactive maintenance strategies
• Predictive maintenance capabilities to prevent unplanned downtime
• Cost optimization through efficient resource utilization and planning
• Full safety compliance with all regulatory and internal requirements

Key Performance Expectations:
- Maintenance activities must be executed according to scheduled plans and procedures
- Asset performance monitoring must provide early warning of potential issues
- Maintenance costs must be optimized while maintaining reliability targets
- All safety protocols must be strictly followed during maintenance operations`
      : "Define clear expectations for this process including what outcomes are expected, quality standards, and success criteria.";
    
    addText(expectationsContent, 25, 10, 165);
    
    // 2. RESPONSIBILITIES
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    addText('2. RESPONSIBILITIES', 20, 12);
    doc.setFont('helvetica', 'normal');
    const responsibilitiesContent = process.processNumber === 'OE-4.1' 
      ? `PROCESS OWNER: Asset Management Manager
- Overall accountability for process execution and performance
- Approval of major procurement decisions and design changes
- Stakeholder coordination and communication

DESIGN ENGINEERS:
- Development of technical specifications and design requirements
- Review and approval of vendor designs and technical submittals
- Interface with operations team for design optimization

PROCUREMENT TEAM:
- Vendor evaluation and selection processes
- Contract negotiation and management
- Procurement timeline management and delivery coordination

PROJECT MANAGERS:
- Construction planning and execution oversight
- Quality control and compliance monitoring
- Handover coordination with operations team

OPERATIONS TEAM:
- Operational requirements definition and validation
- Acceptance testing and commissioning support
- Training and handover documentation review`
      : process.processNumber === 'OE-4.2'
      ? `PROCESS OWNER: Asset Management Manager
- Overall accountability for asset performance and maintenance excellence
- Resource allocation and maintenance strategy approval
- Performance monitoring and continuous improvement initiatives

MAINTENANCE MANAGERS:
- Maintenance planning and scheduling coordination
- Work order management and execution oversight
- Maintenance team supervision and performance management

MAINTENANCE TECHNICIANS:
- Preventive and corrective maintenance execution
- Asset condition monitoring and reporting
- Compliance with safety and quality procedures

RELIABILITY ENGINEERS:
- Asset performance analysis and optimization
- Failure analysis and root cause investigation
- Maintenance strategy development and improvement

OPERATIONS SUPERVISORS:
- Operational coordination during maintenance activities
- Asset performance monitoring and feedback
- Production planning integration with maintenance schedules`
      : "Outline roles and responsibilities for all stakeholders involved in this process, including process owners, participants, and approvers.";
    
    addText(responsibilitiesContent, 25, 10, 165);
    
    // 3. PROCESS STEPS CONTENT
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    addText('3. PROCESS STEPS', 20, 12);
    doc.setFont('helvetica', 'normal');
    const processStepsContent = process.processNumber === 'OE-4.1' 
      ? `This Asset Management Design & Procurement process follows a systematic approach:

DESIGN PHASE METHODOLOGY:
The design phase establishes technical requirements based on operational needs and performance targets. Engineering teams develop detailed specifications considering safety, reliability, maintainability, and lifecycle costs. Design reviews ensure alignment with WSM standards and best practices.

PROCUREMENT STRATEGY:
Procurement activities follow WSM procurement policies ensuring competitive bidding, vendor qualification, and contract terms optimization. Technical and commercial evaluations are conducted to select vendors that best meet project requirements while delivering value for money.

CONSTRUCTION MANAGEMENT:
Construction execution requires close coordination between project teams, contractors, and operations personnel. Quality control checkpoints ensure compliance with specifications and standards. Progress monitoring and risk management are essential throughout the construction phase.

COMMISSIONING & HANDOVER:
The commissioning process validates that assets meet design specifications and operational requirements. Comprehensive testing, documentation preparation, and training delivery ensure smooth transition to operations with full operational readiness.`
      : process.processNumber === 'OE-4.2'
      ? `This Asset Management Operations & Maintenance process ensures optimal asset performance:

STRATEGIC PLANNING APPROACH:
Maintenance strategies are developed based on asset criticality, failure modes, and business impact analysis. Preventive maintenance programs are established using manufacturer recommendations, industry best practices, and historical performance data.

OPERATIONAL EXECUTION:
Day-to-day maintenance operations follow established procedures and work instructions. Maintenance crews execute planned and unplanned work orders while maintaining safety and quality standards. Real-time coordination ensures minimal impact on production operations.

MONITORING & ANALYTICS:
Continuous monitoring systems track asset performance indicators, vibration analysis, oil analysis, and other condition-based parameters. Data analytics identify trends and predict potential failures enabling proactive maintenance interventions.

CONTINUOUS IMPROVEMENT:
Regular performance reviews identify opportunities for maintenance optimization. Failure analysis drives improvements in maintenance procedures and asset reliability. Best practice sharing and lessons learned enhance overall maintenance effectiveness.`
      : "Provide comprehensive guidance on executing process steps, including methodology, best practices, and coordination requirements.";
    
    addText(processStepsContent, 25, 10, 165);
    
    // 4. PERFORMANCE MEASURE
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    addText('4. PERFORMANCE MEASURE', 20, 12);
    doc.setFont('helvetica', 'normal');
    const performanceMeasureContent = process.processNumber === 'OE-4.1' 
      ? `ASSET MANAGEMENT DESIGN & PROCUREMENT PERFORMANCE FRAMEWORK:

PRIMARY PERFORMANCE INDICATORS:
• Design Quality Index: Measures design completeness and accuracy (Target: >95%)
• Procurement Cost Performance: Actual vs. budgeted costs (Target: Within +/-5%)
• Schedule Performance Index: Project timeline adherence (Target: >90%)
• Asset Availability at Handover: Operational readiness (Target: >98%)

QUALITY METRICS:
• Design Review Completion Rate: All required reviews completed (Target: 100%)
• Vendor Performance Score: Quality, delivery, and service rating (Target: >85%)
• Construction Quality Index: Defect rate and rework requirements (Target: <2%)
• Commissioning First-Pass Success: Systems operational without major issues (Target: >95%)

MEASUREMENT PROCEDURES:
- Monthly performance dashboards with traffic light indicators
- Quarterly stakeholder reviews with detailed performance analysis
- Annual benchmarking against industry standards and best practices
- Continuous tracking of cost, schedule, and quality metrics throughout project lifecycle

REPORTING REQUIREMENTS:
Weekly progress reports during active phases, monthly executive summaries, and quarterly comprehensive performance reviews with improvement action plans.`
      : process.processNumber === 'OE-4.2'
      ? `ASSET MANAGEMENT OPERATIONS & MAINTENANCE PERFORMANCE FRAMEWORK:

PRIMARY PERFORMANCE INDICATORS:
• Overall Equipment Effectiveness (OEE): Availability × Performance × Quality (Target: >85%)
• Mean Time Between Failures (MTBF): Asset reliability measure (Target: Industry benchmark +10%)
• Mean Time To Repair (MTTR): Maintenance efficiency (Target: <4 hours)
• Planned Maintenance Compliance: Schedule adherence (Target: >95%)

COST & EFFICIENCY METRICS:
• Maintenance Cost per Unit of Production: Cost effectiveness (Target: Decreasing trend)
• Preventive vs. Reactive Maintenance Ratio: Proactive maintenance balance (Target: 80:20)
• Maintenance Labor Productivity: Work hours per completed work order (Target: Improving trend)
• Asset Lifecycle Cost: Total cost of ownership optimization (Target: <Budget baseline)

MEASUREMENT PROCEDURES:
- Real-time monitoring through CMMS and condition monitoring systems
- Daily maintenance performance reviews and KPI tracking
- Weekly maintenance planning and scheduling effectiveness assessments
- Monthly asset performance analysis with trend identification

REPORTING REQUIREMENTS:
Daily operational dashboards, weekly maintenance scorecards, monthly executive reports, and quarterly asset management reviews with strategic planning updates.`
      : "Establish performance measurement framework including key metrics, monitoring procedures, and reporting requirements.";
    
    addText(performanceMeasureContent, 25, 10, 165);
    
    // Footer
    checkNewPage(20);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos);
    doc.text(`WSM Operational Excellence Framework`, 20, yPos + 7);
    
    // Save the PDF
    doc.save(`${process.processNumber}-${process.name.replace(/\s+/g, '-')}-Complete.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Process documentation has been exported successfully",
    });
  };

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

  const { data: process, isLoading: processLoading, error: processError } = useQuery<OeProcessWithDetails>({
    queryKey: ["/api/oe-processes", id],
    enabled: isAuthenticated && !!id,
  });

  // Handle process error
  useEffect(() => {
    if (processError) {
      if (isUnauthorizedError(processError)) {
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
        description: "Failed to load process details",
        variant: "destructive",
      });
    }
  }, [processError, toast]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getElementIcon = (elementNumber: number) => {
    switch (elementNumber) {
      case 1: return "👑";
      case 2: return "🔄";
      case 3: return "👥";
      case 4: return "🛠️";
      case 5: return "📊";
      case 6: return "💰";
      case 7: return "🛡️";
      case 8: return "🎓";
      default: return "📋";
    }
  };

  if (processLoading) {
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

  if (!process) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="p-6">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Process Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The requested process could not be found or you don't have permission to view it.
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
                  <h1 className="text-2xl font-bold" data-testid="process-title">
                    {process.name}
                  </h1>
                  {process.isMandatory && (
                    <Star className="w-5 h-5 text-accent fill-accent" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span data-testid="process-number">{process.processNumber}</span>
                  <span>•</span>
                  <span>{process.element?.title}</span>
                  <span>•</span>
                  <Badge className={getStatusColor(process.status || 'draft')} data-testid="process-status">
                    {process.status || 'draft'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportPDF} data-testid="button-export-pdf">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" data-testid="button-history">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button size="sm" asChild data-testid="button-edit">
                <Link href={`/process/${process.id}/edit`}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Process Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Process Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {process.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground" data-testid="process-description">
                        {process.description}
                      </p>
                    </div>
                  )}
                  
                  {process.expectations && (
                    <div>
                      <h4 className="font-medium mb-2">Expectations</h4>
                      <p className="text-muted-foreground" data-testid="process-expectations">
                        {process.expectations}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Process Flow Diagram */}
              <ProcessFlowDiagram 
                processName={process.name}
                processNumber={process.processNumber}
                steps={process.steps || []}
              />

              {/* Process Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Process Steps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {process.steps && process.steps.length > 0 ? (
                    <div className="space-y-4">
                      {process.steps.map((step, index) => (
                        <div key={step.id} className="border rounded-lg p-4" data-testid={`process-step-${index}`}>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                              {step.stepNumber}
                            </div>
                            <h4 className="font-medium">{step.stepName}</h4>
                          </div>
                          
                          {step.stepDetails && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-muted-foreground mb-1">Details</h5>
                              <p className="text-sm">{step.stepDetails}</p>
                            </div>
                          )}
                          
                          {step.responsibilities && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-muted-foreground mb-1">Responsibilities</h5>
                              <p className="text-sm">{step.responsibilities}</p>
                            </div>
                          )}
                          
                          {step.references && (
                            <div>
                              <h5 className="text-sm font-medium text-muted-foreground mb-1">References</h5>
                              <p className="text-sm">{step.references}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No process steps defined yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TABLE OF CONTENTS Sections */}
              <ProcessContentSections process={process} />

              {/* Performance Measures */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Performance Measures</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {process.performanceMeasures && process.performanceMeasures.length > 0 ? (
                    <div className="space-y-4">
                      {process.performanceMeasures.map((measure, index) => (
                        <div key={measure.id} className="border rounded-lg p-4" data-testid={`performance-measure-${index}`}>
                          <h4 className="font-medium mb-2">{measure.measureName}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {measure.formula && (
                              <div>
                                <span className="text-muted-foreground">Formula: </span>
                                <span>{measure.formula}</span>
                              </div>
                            )}
                            {measure.source && (
                              <div>
                                <span className="text-muted-foreground">Source: </span>
                                <span>{measure.source}</span>
                              </div>
                            )}
                            {measure.frequency && (
                              <div>
                                <span className="text-muted-foreground">Frequency: </span>
                                <span>{measure.frequency}</span>
                              </div>
                            )}
                            {measure.target && (
                              <div>
                                <span className="text-muted-foreground">Target: </span>
                                <span>{measure.target}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No performance measures defined yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Process Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                      {getElementIcon(process.element?.elementNumber || 1)}
                    </div>
                    <div>
                      <p className="font-medium">OE Element No. {process.element?.elementNumber}</p>
                      <p className="text-sm text-muted-foreground">{process.element?.title}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Process Owner</span>
                      <span data-testid="process-owner">{process.processOwner || 'Not assigned'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Revision</span>
                      <span data-testid="process-revision">v{process.revision}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mandatory</span>
                      <span data-testid="process-mandatory">{process.isMandatory ? 'Yes' : 'No'}</span>
                    </div>
                    
                    {process.issueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Issue Date</span>
                        <span data-testid="process-issue-date">
                          {new Date(process.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {process.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span data-testid="process-created-date">
                          {new Date(process.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {process.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span data-testid="process-updated-date">
                          {new Date(process.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Versions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Document Versions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {process.versions && process.versions.length > 0 ? (
                    <div className="space-y-3">
                      {process.versions.slice(0, 5).map((version, index) => (
                        <div key={version.id} className="flex items-center justify-between text-sm" data-testid={`version-${index}`}>
                          <div>
                            <p className="font-medium">Version {version.versionNumber}</p>
                            {version.changeLog && (
                              <p className="text-muted-foreground text-xs">{version.changeLog}</p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {version.createdAt ? new Date(version.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p>No version history available.</p>
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
