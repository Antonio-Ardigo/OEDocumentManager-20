import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  Activity,
  User,
  Calendar,
  Filter,
  FileText
} from "lucide-react";
import MiniProcessFlow from "@/components/mini-process-flow";
import type { OeProcessWithDetails } from "@shared/schema";

export default function AllProcesses() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get search params from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialSearch = urlParams.get('search') || '';
  
  // Local filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');


  const { data: allProcesses, isLoading: processesLoading, error: processesError } = useQuery<OeProcessWithDetails[]>({
    queryKey: ["/api/oe-processes"],
    enabled: true,
  });

  // Filter processes based on search and filters
  const processes = useMemo(() => {
    if (!allProcesses) return [];
    
    return allProcesses.filter(process => {
      // Search filter
      const searchMatch = !searchQuery || 
        process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.processNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.element?.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter  
      const statusMatch = statusFilter === 'all' || process.status === statusFilter;
      
      // Element filter
      const elementMatch = elementFilter === 'all' || process.element?.elementNumber.toString() === elementFilter;
      
      return searchMatch && statusMatch && elementMatch;
    });
  }, [allProcesses, searchQuery, statusFilter, elementFilter]);

  // Handle processes error
  useEffect(() => {
    if (processesError) {
      toast({
        title: "Error",
        description: "Failed to load processes",
        variant: "destructive",
      });
    }
  }, [processesError, toast]);

  if (processesLoading) {
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

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" data-testid="processes-title">
                All Processes
              </h1>
              <p className="text-muted-foreground">
                Manage and monitor all OE processes across your organization
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" data-testid="button-export">
                <FileText className="w-4 h-4 mr-2" />
                Export List
              </Button>
              <Button size="sm" asChild data-testid="button-create-process">
                <Link href="/create-process">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Process
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-processes"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={elementFilter} onValueChange={setElementFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-element">
                <SelectValue placeholder="Filter by element" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elements</SelectItem>
                <SelectItem value="1">OE Element 1</SelectItem>
                <SelectItem value="2">OE Element 2</SelectItem>
                <SelectItem value="3">OE Element 3</SelectItem>
                <SelectItem value="4">Asset Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Processes List */}
          <div className="space-y-4">
            {processesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : processes && processes.length > 0 ? (
              <div className="space-y-4">
                {processes.map((process) => (
                  <Card key={process.id} className="cursor-pointer transition-all duration-200 hover:shadow-md" data-testid={`process-card-${process.id}`}>
                    <Link href={`/process/${process.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Activity className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg">{process.name}</h3>
                                <Badge className={getStatusColor(process.status || 'draft')}>
                                  {process.status || 'draft'}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span data-testid="process-number">{process.processNumber}</span>
                                <span>•</span>
                                <span>{process.element?.title}</span>
                                {process.isMandatory && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-xs">Mandatory</Badge>
                                  </>
                                )}
                              </div>
                              {process.description && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {process.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-6 text-xs text-muted-foreground mb-3">
                                {process.processOwner && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>{process.processOwner}</span>
                                  </div>
                                )}
                                {process.updatedAt && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Updated {new Date(process.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Activity className="w-3 h-3" />
                                  <span>{process.steps?.length || 0} steps</span>
                                </div>
                              </div>
                              
                              {/* Mini Process Flow */}
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <MiniProcessFlow 
                                  processNumber={process.processNumber}
                                  steps={process.steps || []}
                                  compact={true}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Processes Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first OE process or browse available templates.
                  </p>
                  <Button asChild data-testid="button-create-first-process">
                    <Link href="/create-process">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Process
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}