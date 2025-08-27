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
import type { OeProcessWithDetails } from "@shared/schema";

export default function ProcessDetail() {
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

  const { data: process, isLoading: processLoading } = useQuery<OeProcessWithDetails>({
    queryKey: ["/api/oe-processes", id],
    enabled: isAuthenticated && !!id,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

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
              <Button variant="outline" size="sm" data-testid="button-download">
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
                            {new Date(version.createdAt).toLocaleDateString()}
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
