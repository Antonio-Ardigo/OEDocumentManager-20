import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import ProcessCard from "@/components/process-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Upload, 
  FileText, 
  Folder, 
  Activity, 
  Clock, 
  CheckCircle2,
  Edit3,
  User as UserIcon,
  Grid3X3,
  List
} from "lucide-react";
import type { OeElementWithProcesses, ActivityLog, User } from "@shared/schema";

interface DashboardStats {
  totalProcesses: number;
  activeElements: number;
  pendingReviews: number;
  completionRate: number;
}

interface ActivityWithUser extends ActivityLog {
  user?: User;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [elementFilter, setElementFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Note: Authentication no longer required - guests have full access

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Handle stats error
  useEffect(() => {
    if (statsError) {
      if (isUnauthorizedError(statsError)) {
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
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  }, [statsError, toast]);

  const { data: elements, isLoading: elementsLoading, error: elementsError } = useQuery<OeElementWithProcesses[]>({
    queryKey: ["/api/oe-elements"],
  });

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/activity-log"],
  });

  // Handle elements error
  useEffect(() => {
    if (elementsError) {
      if (isUnauthorizedError(elementsError)) {
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
  }, [elementsError, toast]);

  // Handle activities error
  useEffect(() => {
    if (activitiesError) {
      if (isUnauthorizedError(activitiesError)) {
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
        description: "Failed to load activity log",
        variant: "destructive",
      });
    }
  }, [activitiesError, toast]);

  if (isLoading) {
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

  // Filter elements based on selected filter
  const filteredElements = elements?.filter(element => {
    if (!elementFilter) return true;
    
    switch (elementFilter) {
      case 'active':
        return element.isActive;
      case 'inactive':
        return !element.isActive;
      case 'draft':
        // Elements with no processes could be considered drafts
        return !element.processes || element.processes.length === 0;
      default:
        return true;
    }
  }) || [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Processes</p>
                    <p className="text-3xl font-bold text-primary" data-testid="stat-total-processes">
                      {statsLoading ? '...' : stats?.totalProcesses || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Folder className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="h-auto p-6 justify-start"
                asChild
                data-testid="button-create-element"
              >
                <Link href="/create-element">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Plus className="text-primary text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Create New Element</h3>
                      <p className="text-sm text-muted-foreground">Add a new OE element to the framework</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

          {/* OE Elements Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">OE Elements</h2>
              <div className="flex items-center space-x-4">
                <select 
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm" 
                  data-testid="select-filter-elements"
                  value={elementFilter}
                  onChange={(e) => setElementFilter(e.target.value)}
                >
                  <option value="">All Elements</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="draft">Drafts</option>
                </select>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  data-testid="button-toggle-view"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      List View
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Grid View
                    </>
                  )}
                </Button>
              </div>
            </div>

            {elementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredElements.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredElements.map((element) => (
                  <ProcessCard key={element.id} element={element} viewMode={viewMode} />
                ))}
              </div>
            ) : elements && elements.length > 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Elements Match Filter</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filter or create a new element.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setElementFilter("")}
                    data-testid="button-clear-filter"
                  >
                    Clear Filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No OE Elements Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first OE element to begin managing processes.
                  </p>
                  <Button asChild data-testid="button-create-first-element">
                    <Link href="/create-element">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Element
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card id="activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading activity...</p>
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.action === 'created' && <Plus className="w-4 h-4 text-green-600" />}
                        {activity.action === 'updated' && <Edit3 className="w-4 h-4 text-blue-600" />}
                        {activity.action === 'deleted' && <Activity className="w-4 h-4 text-red-600" />}
                        {activity.action === 'viewed' && <FileText className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {activity.description || `${activity.action} ${activity.entityType}`}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.user ? 
                            `${activity.user.firstName || activity.user.email}` : 
                            'System'
                          } • {activity.entityName || activity.entityType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Recent Activity</h4>
                  <p className="text-muted-foreground">
                    Start creating and managing processes to see activity here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button 
        className="fab w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        asChild
        data-testid="fab-create-element"
      >
        <Link href="/create-element">
          <Plus className="w-6 h-6" />
        </Link>
      </Button>
    </div>
  );
}
