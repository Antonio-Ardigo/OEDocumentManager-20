import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Users, 
  Target, 
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OeProcessWithDetails } from "@shared/schema";

interface ProcessContentSectionsProps {
  process: OeProcessWithDetails;
  readonly?: boolean;
}

interface ContentSection {
  key: keyof OeProcessWithDetails;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  defaultContent: string;
}

export default function ProcessContentSections({ process, readonly = false }: ProcessContentSectionsProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contentSections: ContentSection[] = [
    {
      key: "expectations",
      title: "EXPECTATIONS",
      icon: CheckCircle,
      number: 1,
      defaultContent: "Define clear expectations for this process including what outcomes are expected, quality standards, and success criteria."
    },
    {
      key: "responsibilities",
      title: "RESPONSIBILITIES", 
      icon: Users,
      number: 2,
      defaultContent: "Outline roles and responsibilities for all stakeholders involved in this process, including process owners, participants, and approvers."
    },
    {
      key: "processStepsContent",
      title: "PROCESS STEPS",
      icon: Target,
      number: 3,
      defaultContent: "Provide comprehensive guidance on executing process steps, including methodology, best practices, and coordination requirements."
    },
    {
      key: "performanceMeasureContent",
      title: "PERFORMANCE MEASURE",
      icon: BarChart3,
      number: 4,
      defaultContent: "Establish performance measurement framework including key metrics, monitoring procedures, and reporting requirements."
    }
  ];

  const updateProcessMutation = useMutation({
    mutationFn: async (data: { [key: string]: string }) => {
      return await apiRequest(`/api/oe-processes/${process.id}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Process content updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/oe-processes", process.id] });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update process content",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const startEditing = (section: ContentSection) => {
    setEditingSection(section.key);
    setEditingContent((process[section.key] as string) || section.defaultContent);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditingContent("");
  };

  const saveContent = () => {
    if (editingSection) {
      updateProcessMutation.mutate({ [editingSection]: editingContent });
    }
  };

  const getProcessSpecificContent = (section: ContentSection): string => {
    // Return actual content if it exists, otherwise provide process-specific default content
    const existingContent = process[section.key] as string;
    if (existingContent) return existingContent;

    // Process-specific default content based on process number
    const processNumber = process.processNumber;
    
    switch (section.key) {
      case "expectations":
        if (processNumber === "OE-4.1") {
          return `Asset Management Design & Procurement process is expected to deliver:
• Optimized asset performance through effective design and procurement strategies
• Cost-effective procurement decisions that balance quality, cost, and delivery requirements
• Quality construction delivery meeting all specifications and standards
• Smooth operational handover with proper documentation and training

Key Performance Expectations:
- All procurement activities must comply with WSM procurement policies and procedures
- Design specifications must meet operational requirements and safety standards
- Construction quality must achieve planned asset reliability and availability targets
- Handover documentation must be complete and accurate for operational readiness`;
        } else if (processNumber === "OE-4.2") {
          return `Asset Management Operations & Maintenance process is expected to deliver:
• Maximum asset uptime through proactive maintenance strategies
• Predictive maintenance capabilities to prevent unplanned downtime
• Cost optimization through efficient resource utilization and planning
• Full safety compliance with all regulatory and internal requirements

Key Performance Expectations:
- Maintenance activities must be executed according to scheduled plans and procedures
- Asset performance monitoring must provide early warning of potential issues
- Maintenance costs must be optimized while maintaining reliability targets
- All safety protocols must be strictly followed during maintenance operations`;
        }
        return section.defaultContent;

      case "responsibilities":
        if (processNumber === "OE-4.1") {
          return `PROCESS OWNER: Asset Management Manager
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
- Training and handover documentation review`;
        } else if (processNumber === "OE-4.2") {
          return `PROCESS OWNER: Asset Management Manager
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
- Production planning integration with maintenance schedules`;
        }
        return section.defaultContent;

      case "processStepsContent":
        if (processNumber === "OE-4.1") {
          return `This Asset Management Design & Procurement process follows a systematic approach:

DESIGN PHASE METHODOLOGY:
The design phase establishes technical requirements based on operational needs and performance targets. Engineering teams develop detailed specifications considering safety, reliability, maintainability, and lifecycle costs. Design reviews ensure alignment with WSM standards and best practices.

PROCUREMENT STRATEGY:
Procurement activities follow WSM procurement policies ensuring competitive bidding, vendor qualification, and contract terms optimization. Technical and commercial evaluations are conducted to select vendors that best meet project requirements while delivering value for money.

CONSTRUCTION MANAGEMENT:
Construction execution requires close coordination between project teams, contractors, and operations personnel. Quality control checkpoints ensure compliance with specifications and standards. Progress monitoring and risk management are essential throughout the construction phase.

COMMISSIONING & HANDOVER:
The commissioning process validates that assets meet design specifications and operational requirements. Comprehensive testing, documentation preparation, and training delivery ensure smooth transition to operations with full operational readiness.`;
        } else if (processNumber === "OE-4.2") {
          return `This Asset Management Operations & Maintenance process ensures optimal asset performance:

STRATEGIC PLANNING APPROACH:
Maintenance strategies are developed based on asset criticality, failure modes, and business impact analysis. Preventive maintenance programs are established using manufacturer recommendations, industry best practices, and historical performance data.

OPERATIONAL EXECUTION:
Day-to-day maintenance operations follow established procedures and work instructions. Maintenance crews execute planned and unplanned work orders while maintaining safety and quality standards. Real-time coordination ensures minimal impact on production operations.

MONITORING & ANALYTICS:
Continuous monitoring systems track asset performance indicators, vibration analysis, oil analysis, and other condition-based parameters. Data analytics identify trends and predict potential failures enabling proactive maintenance interventions.

CONTINUOUS IMPROVEMENT:
Regular performance reviews identify opportunities for maintenance optimization. Failure analysis drives improvements in maintenance procedures and asset reliability. Best practice sharing and lessons learned enhance overall maintenance effectiveness.`;
        }
        return section.defaultContent;

      case "performanceMeasureContent":
        if (processNumber === "OE-4.1") {
          return `ASSET MANAGEMENT DESIGN & PROCUREMENT PERFORMANCE FRAMEWORK:

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
Weekly progress reports during active phases, monthly executive summaries, and quarterly comprehensive performance reviews with improvement action plans.`;
        } else if (processNumber === "OE-4.2") {
          return `ASSET MANAGEMENT OPERATIONS & MAINTENANCE PERFORMANCE FRAMEWORK:

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
Daily operational dashboards, weekly maintenance scorecards, monthly executive reports, and quarterly asset management reviews with strategic planning updates.`;
        }
        return section.defaultContent;

      default:
        return section.defaultContent;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>TABLE OF CONTENTS</span>
          <Badge variant="outline" className="ml-2">Process Documentation</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {contentSections.map((section, index) => {
          const Icon = section.icon;
          const content = getProcessSpecificContent(section);
          const isEditing = editingSection === section.key;
          
          return (
            <div key={section.key}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {section.number}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                    </div>
                  </div>
                  
                  {!isEditing && !readonly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(section)}
                      data-testid={`button-edit-${section.key}`}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      placeholder={`Enter ${section.title.toLowerCase()} content...`}
                      data-testid={`textarea-${section.key}`}
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={saveContent}
                        disabled={updateProcessMutation.isPending}
                        data-testid={`button-save-${section.key}`}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProcessMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={updateProcessMutation.isPending}
                        data-testid={`button-cancel-${section.key}`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid={`content-${section.key}`}>
                      {content}
                    </div>
                  </div>
                )}
              </div>
              
              {index < contentSections.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}