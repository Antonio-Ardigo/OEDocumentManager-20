import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowDown, Download, FileText } from "lucide-react";
import type { ProcessStep } from "@shared/schema";

interface ProcessFlowDiagramProps {
  processName: string;
  processNumber: string;
  steps: ProcessStep[];
}

export default function ProcessFlowDiagram({ processName, processNumber, steps }: ProcessFlowDiagramProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  // Create visual styles based on process type (all horizontal now)
  const getProcessStyles = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-50',
          accent: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'OE-4.2':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-50',
          accent: 'text-green-700',
          border: 'border-green-200'
        };
      default:
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-50',
          accent: 'text-purple-700',
          border: 'border-purple-200'
        };
    }
  };

  const styles = getProcessStyles(processNumber);
  
  // Get enabling elements for process
  const getEnablingElements = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return ['Risk Management', 'Document Control', 'Change Management', 'Quality Assurance'];
      case 'OE-4.2':
        return ['Performance Monitoring', 'Maintenance Planning', 'Inspection Programs', 'Asset Integrity'];
      default:
        return ['Quality Management', 'Risk Assessment', 'Documentation', 'Training'];
    }
  };

  const enablingElements = getEnablingElements(processNumber);
  
  // Get process description
  const getProcessDescription = (processNumber: string) => {
    switch (processNumber) {
      case 'OE-4.1':
        return {
          purpose: "This process ensures effective management of physical assets throughout their entire lifecycle from design and procurement through construction, commissioning, and handover to operations.",
          scope: "Applies to all major capital projects, equipment procurement, and infrastructure development within WSM operations.",
          expectedOutcomes: ["Optimized asset performance", "Cost-effective procurement", "Quality construction delivery", "Smooth operational handover"]
        };
      case 'OE-4.2':
        return {
          purpose: "This process establishes systematic approaches for maintaining asset integrity, optimizing performance, and ensuring safe and reliable operations throughout the asset lifecycle.",
          scope: "Covers all operational assets including facilities, equipment, and infrastructure systems under WSM management.",
          expectedOutcomes: ["Maximum asset uptime", "Predictive maintenance", "Cost optimization", "Safety compliance"]
        };
      default:
        return {
          purpose: "This process defines systematic approaches for managing operational excellence activities within the organization.",
          scope: "Applies to all relevant organizational activities and stakeholders.",
          expectedOutcomes: ["Improved efficiency", "Enhanced quality", "Risk mitigation", "Continuous improvement"]
        };
    }
  };

  const processDesc = getProcessDescription(processNumber);

  const handleExportPDF = async () => {
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
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    addText(`WSM Operational Excellence Process`, 20, 20);
    
    doc.setFontSize(16);
    addText(`${processName}`, 20, 16);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    addText(`Process Number: ${processNumber}`, 20, 12);
    addText(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 12);
    
    yPos += 10;
    
    // Process Flow Representation
    checkNewPage(50);
    doc.setFont('helvetica', 'bold');
    addText('PROCESS FLOW DIAGRAM', 20, 14);
    doc.setFont('helvetica', 'normal');
    
    // Create text-based flow diagram
    const flowText = steps.map((step, index) => {
      const arrow = index < steps.length - 1 ? ' → ' : '';
      return `[${step.stepNumber}] ${step.stepName}${arrow}`;
    }).join('');
    
    addText(`Flow: ${flowText}`, 20, 10, 170);
    
    // Process steps details
    if (steps.length > 0) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      addText('DETAILED PROCESS STEPS', 20, 12);
      doc.setFont('helvetica', 'normal');
      
      steps.forEach((step, index) => {
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
    const expectationsContent = processNumber === 'OE-4.1' 
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
      : processNumber === 'OE-4.2'
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
    const responsibilitiesContent = processNumber === 'OE-4.1' 
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
      : processNumber === 'OE-4.2'
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
    const processStepsContent = processNumber === 'OE-4.1' 
      ? `This Asset Management Design & Procurement process follows a systematic approach:

DESIGN PHASE METHODOLOGY:
The design phase establishes technical requirements based on operational needs and performance targets. Engineering teams develop detailed specifications considering safety, reliability, maintainability, and lifecycle costs. Design reviews ensure alignment with WSM standards and best practices.

PROCUREMENT STRATEGY:
Procurement activities follow WSM procurement policies ensuring competitive bidding, vendor qualification, and contract terms optimization. Technical and commercial evaluations are conducted to select vendors that best meet project requirements while delivering value for money.

CONSTRUCTION MANAGEMENT:
Construction execution requires close coordination between project teams, contractors, and operations personnel. Quality control checkpoints ensure compliance with specifications and standards. Progress monitoring and risk management are essential throughout the construction phase.

COMMISSIONING & HANDOVER:
The commissioning process validates that assets meet design specifications and operational requirements. Comprehensive testing, documentation preparation, and training delivery ensure smooth transition to operations with full operational readiness.`
      : processNumber === 'OE-4.2'
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
    const performanceMeasureContent = processNumber === 'OE-4.1' 
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
      : processNumber === 'OE-4.2'
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
    doc.save(`${processNumber}-${processName.replace(/\s+/g, '-')}-Complete.pdf`);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div 
              className={`w-6 h-6 ${styles.primary} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
            >
              {steps.length}
            </div>
            <span>Process Flow Overview</span>
            <Badge variant="outline" className={styles.accent}>
              {processNumber}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportPDF} data-testid="button-export-pdf">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Process Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{processName}</h3>
            <p className="text-sm text-muted-foreground">
              {steps.length} step{steps.length !== 1 ? 's' : ''} in this process
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="flex flex-row items-center justify-start space-x-3 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                {/* Step Box */}
                <div 
                  className={`min-w-32 max-w-48 ${styles.secondary} ${styles.border} rounded-lg p-3 border hover:shadow-sm transition-all duration-200 cursor-pointer group`}
                  data-testid={`flow-step-${index}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-6 h-6 ${styles.primary} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-xs ${styles.accent} group-hover:text-primary line-clamp-1`}>
                        {step.stepName}
                      </h4>
                    </div>
                  </div>
                  
                  {step.stepDetails && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {step.stepDetails.length > 60 
                        ? `${step.stepDetails.substring(0, 60)}...`
                        : step.stepDetails
                      }
                    </p>
                  )}
                  
                  {step.responsibilities && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                        {step.responsibilities.split(',')[0].trim()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow connector (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center mx-2">
                    <ChevronRight 
                      className={`w-4 h-4 ${styles.accent}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Process Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Purpose
                </h4>
                <p className="text-sm text-muted-foreground">{processDesc.purpose}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Scope</h4>
                <p className="text-sm text-muted-foreground">{processDesc.scope}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Expected Outcomes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {processDesc.expectedOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-2 h-2 ${styles.primary} rounded-full mr-2`}></div>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Enabling Elements */}
          <div className={`${styles.secondary} ${styles.border} rounded-lg p-4 border`}>
            <h4 className="font-semibold text-sm mb-3">Enabling OE Elements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {enablingElements.map((element, index) => (
                <div key={index} className={`bg-white rounded px-3 py-2 text-center border ${styles.border}`}>
                  <span className={`text-xs font-medium ${styles.accent}`}>{element}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Process Summary */}
          <div className={`${styles.secondary} rounded-lg p-4 border border-border/50`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Process Summary:</span>
                <span className="text-muted-foreground">
                  {processNumber === 'OE-4.1' && 'Design → Procure → Construct → Commission'}
                  {processNumber === 'OE-4.2' && 'Strategy → Operate → Monitor → Improve'}
                  {!['OE-4.1', 'OE-4.2'].includes(processNumber) && 'Sequential Process Flow'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Horizontal Flow
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}