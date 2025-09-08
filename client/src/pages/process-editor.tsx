import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import ProcessForm from "@/components/process-form";
import ProcessContentSections from "@/components/process-content-sections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import type { OeProcessWithDetails, OeElementWithProcesses } from "@shared/schema";

export default function ProcessEditor() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;


  const { data: process, isLoading: processLoading, error: processError } = useQuery<OeProcessWithDetails>({
    queryKey: ["/api/oe-processes", id],
    enabled: isEditing && !!id,
  });

  // Handle process error
  useEffect(() => {
    if (processError) {
      toast({
        title: "Error",
        description: "Failed to load process details",
        variant: "destructive",
      });
    }
  }, [processError, toast]);

  const { data: elements, isLoading: elementsLoading, error: elementsError } = useQuery<OeElementWithProcesses[]>({
    queryKey: ["/api/oe-elements"],
    enabled: true,
  });

  // Handle elements error
  useEffect(() => {
    if (elementsError) {
      toast({
        title: "Error",
        description: "Failed to load OE elements",
        variant: "destructive",
      });
    }
  }, [elementsError, toast]);

  const createProcessMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/oe-processes", data);
      return response.json();
    },
    onSuccess: (newProcess) => {
      queryClient.invalidateQueries({ queryKey: ["/api/oe-processes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/oe-elements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Process created successfully",
      });
      setLocation(`/process/${newProcess.id}`);
    },
    onError: (error: Error) => {

      toast({
        title: "Error",
        description: "Failed to create process",
        variant: "destructive",
      });
    },
  });

  const updateProcessMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/oe-processes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the specific process query
      queryClient.invalidateQueries({ queryKey: [`/api/oe-processes/${id}`] });
      // Invalidate the process list queries
      queryClient.invalidateQueries({ queryKey: ["/api/oe-processes", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/oe-processes"] });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/oe-elements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Process updated successfully",
      });
      setLocation(`/process/${id}`);
    },
    onError: (error: Error) => {
      console.error("Process update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update process",
        variant: "destructive",
      });
    },
  });

  const deleteProcessMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/oe-processes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oe-processes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/oe-elements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Process deleted successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete process",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: any) => {
    // Convert "none" values to null for strategicGoalId
    const processedData = {
      ...data,
      performanceMeasures: data.performanceMeasures?.map((measure: any) => ({
        ...measure,
        strategicGoalId: measure.strategicGoalId === "none" ? null : measure.strategicGoalId,
      })) || []
    };

    if (isEditing) {
      updateProcessMutation.mutate(processedData);
    } else {
      createProcessMutation.mutate(processedData);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setLocation(`/process/${id}`);
    } else {
      setLocation("/");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this process? This action cannot be undone.")) {
      deleteProcessMutation.mutate();
    }
  };


  if (isEditing && processLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isEditing && !process) {
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
                  The requested process could not be found or you don't have permission to edit it.
                </p>
                <Button onClick={() => setLocation("/")} data-testid="button-back-to-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" data-testid="editor-title">
                  {isEditing ? 'Edit Process' : 'Create New Process'}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing ? 'Modify the process details and components' : 'Create a new OE process from scratch or template'}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                data-testid="button-cancel"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <ProcessForm
              process={process}
              elements={elements || []}
              isLoading={createProcessMutation.isPending || updateProcessMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />

            {/* TABLE OF CONTENTS Sections - Editable */}
            {isEditing && process && (
              <div className="mt-6">
                <ProcessContentSections process={process} />
              </div>
            )}

            {isEditing && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteProcessMutation.isPending}
                    data-testid="button-delete-process"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteProcessMutation.isPending ? "Deleting..." : "Delete Process"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
