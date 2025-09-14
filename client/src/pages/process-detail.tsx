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
  Edit3,
  History,
  User,
  Calendar,
  FileText,
  Target,
  BarChart3,
  ArrowLeft,
  Star,
  AlertTriangle,
  Shield,
  Download,
  Trash2,
  Paperclip
} from "lucide-react";
import ProcessFlowDiagram from "@/components/process-flow-diagram";
import ProcessContentSections from "@/components/process-content-sections";
import type { OeProcessWithDetails, ProcessDocument } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Scorecard flag mapping function
const getScorecardFlag = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'financial':
      return '💰';
    case 'customer':
      return '👥';
    case 'internal process':
      return '⚙️';
    case 'learning & growth':
      return '📚';
    default:
      return '📊';
  }
};

// Risk assessment utility functions
const getRiskLevel = (frequency?: string, impact?: string, elementNumber?: number) => {
  if (!frequency || !impact) {
    // Strategic Localization (Element 5) doesn't require risk assessments
    if (elementNumber === 5) {
      return { level: "N/A - Strategic Localization", color: "blue", score: 0 };
    }
    return { level: "Not Assessed", color: "gray", score: 0 };
  }
  
  const freqScore = frequency.toLowerCase() === "high" ? 3 : frequency.toLowerCase() === "medium" ? 2 : 1;
  const impactScore = impact.toLowerCase() === "high" ? 3 : impact.toLowerCase() === "medium" ? 2 : 1;
  const totalScore = freqScore * impactScore;
  
  if (totalScore >= 7) return { level: "High Risk", color: "red", score: totalScore };
  if (totalScore >= 3) return { level: "Medium Risk", color: "yellow", score: totalScore };
  return { level: "Low Risk", color: "green", score: totalScore };
};

const getRiskBadgeClass = (color: string) => {
  switch (color) {
    case "red":
      return "bg-red-100 text-red-800 border-red-200";
    case "yellow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "green":
      return "bg-green-100 text-green-800 border-green-200";
    case "blue":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();


  // Note: Authentication no longer required - guests have full access

  const { data: process, isLoading: processLoading, error: processError } = useQuery<OeProcessWithDetails>({
    queryKey: ["/api/oe-processes", id],
    enabled: !!id, // Removed authentication requirement
  });

  // Load strategic goals for displaying linked goal names
  const { data: strategicGoals = [] } = useQuery<any[]>({
    queryKey: ["/api/strategic-goals"],
  });

  // Load process documents
  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery<ProcessDocument[]>({
    queryKey: ["/api/processes", id, "documents"],
    enabled: !!id, // Removed authentication requirement
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete document');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "The document has been removed from this process.",
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  // Handle process error
  useEffect(() => {
    if (processError) {
      // For guest users, just show the error without redirecting
      toast({
        title: "Error",
        description: "Failed to load process details",
        variant: "destructive",
      });
    }
  }, [processError, toast]);

  if (processLoading) {
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

                  {process.inputToProcess && (
                    <div>
                      <h4 className="font-medium mb-2">Input to Process</h4>
                      <p className="text-muted-foreground" data-testid="process-input-to-process">
                        {process.inputToProcess}
                      </p>
                    </div>
                  )}

                  {process.deliverable && (
                    <div>
                      <h4 className="font-medium mb-2">Deliverable</h4>
                      <p className="text-muted-foreground" data-testid="process-deliverable">
                        {process.deliverable}
                      </p>
                    </div>
                  )}

                  {process.criticalToProcessQuality && (
                    <div>
                      <h4 className="font-medium mb-2">Critical To Process Quality</h4>
                      <p className="text-muted-foreground" data-testid="process-critical-to-process-quality">
                        {process.criticalToProcessQuality}
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
                element={process.element}
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
              <ProcessContentSections process={process} readonly={true} />

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {process.riskFrequency && process.riskImpact ? (
                    <div className="space-y-4">
                      {/* Risk Level Badge */}
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                        <Badge 
                          className={`${getRiskBadgeClass(getRiskLevel(process.riskFrequency, process.riskImpact, process.element?.elementNumber).color)} border`}
                          data-testid="risk-level"
                        >
                          {getRiskLevel(process.riskFrequency, process.riskImpact, process.element?.elementNumber).level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {getRiskLevel(process.riskFrequency, process.riskImpact, process.element?.elementNumber).score}/9
                        </span>
                      </div>

                      {/* Risk Matrix */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Risk Frequency</h4>
                          <Badge variant="outline" data-testid="risk-frequency">
                            {process.riskFrequency}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Risk Impact</h4>
                          <Badge variant="outline" data-testid="risk-impact">
                            {process.riskImpact}
                          </Badge>
                        </div>
                      </div>

                      {/* Risk Description */}
                      {process.riskDescription && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Risk Description</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed" data-testid="risk-description">
                            {process.riskDescription}
                          </p>
                        </div>
                      )}

                      {/* Risk Mitigation */}
                      {process.riskMitigation && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Risk Mitigation Strategy</h4>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="risk-mitigation">
                              {process.riskMitigation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {process.element?.elementNumber === 5 ? (
                        // Strategic Localization processes don't require risk assessments
                        <>
                          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="mb-2">No risk assessment required</p>
                          <p className="text-xs">
                            Strategic Localization processes are excluded from risk assessments.
                          </p>
                        </>
                      ) : (
                        // Other processes need risk assessments
                        <>
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="mb-2">Risk assessment not completed</p>
                          <p className="text-xs">
                            Edit this process to add risk frequency, impact, and mitigation details.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{measure.measureName}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              data-testid={`button-edit-measure-${index}`}
                            >
                              <Link href={`/process/${process.id}/edit`}>
                                <Edit3 className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
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
                            {measure.scorecardCategory && (
                              <div>
                                <span className="text-muted-foreground">Scorecard: </span>
                                <span className="flex items-center gap-1">
                                  <span className="text-lg">{getScorecardFlag(measure.scorecardCategory)}</span>
                                  <span>{measure.scorecardCategory}</span>
                                </span>
                              </div>
                            )}
                            {(measure as any).strategicGoalId && (
                              <div>
                                <span className="text-muted-foreground">Linked Goal: </span>
                                <span className="font-medium text-blue-600">
                                  {(() => {
                                    const linkedGoal = strategicGoals.find(goal => 
                                      goal.id === (measure as any).strategicGoalId
                                    );
                                    return linkedGoal ? `${linkedGoal.title} (${linkedGoal.category})` : 'Strategic Goal';
                                  })()}
                                </span>
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

              {/* File Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Paperclip className="w-5 h-5" />
                    <span>File Attachments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading attachments...</p>
                    </div>
                  ) : documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                          data-testid={`attachment-${doc.id}`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate" data-testid="attachment-title">
                                {doc.title}
                              </h4>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{doc.fileName}</span>
                                {doc.fileSize && (
                                  <>
                                    <span>•</span>
                                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                  </>
                                )}
                                {doc.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              data-testid="button-download-attachment"
                            >
                              <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDocumentMutation.mutate(doc.id)}
                              disabled={deleteDocumentMutation.isPending}
                              data-testid="button-delete-attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">No files attached yet</p>
                      <p className="text-xs">
                        Upload documents, images, or other files related to this process.
                      </p>
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
