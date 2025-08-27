import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import { Link } from "wouter";
import type { OeElement } from "@shared/schema";

interface ElementFormData {
  elementNumber: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export default function ElementEditor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const isEditMode = Boolean(id);

  // Available icons for selection
  const iconOptions = [
    { value: "👑", label: "👑 Crown" },
    { value: "📊", label: "📊 Chart" },
    { value: "🏭", label: "🏭 Factory" },
    { value: "⚙️", label: "⚙️ Gear" },
    { value: "🎯", label: "🎯 Target" },
    { value: "💼", label: "💼 Briefcase" },
    { value: "🔒", label: "🔒 Security" },
    { value: "🎓", label: "🎓 Education" },
    { value: "📋", label: "📋 Clipboard" },
    { value: "🚀", label: "🚀 Rocket" },
    { value: "💡", label: "💡 Lightbulb" },
    { value: "🔧", label: "🔧 Wrench" },
    { value: "📈", label: "📈 Growth" },
    { value: "🏆", label: "🏆 Trophy" },
    { value: "🌟", label: "🌟 Star" },
    { value: "💰", label: "💰 Money" },
    { value: "🔍", label: "🔍 Search" },
    { value: "📱", label: "📱 Mobile" },
    { value: "🌍", label: "🌍 Globe" },
    { value: "🔥", label: "🔥 Fire" }
  ];

  const [formData, setFormData] = useState<ElementFormData>({
    elementNumber: 1,
    title: "",
    description: "",
    icon: "📋",
    color: "#3B82F6",
    isActive: true,
  });

  // Load existing element data for edit mode
  const { data: existingElement, isLoading: elementLoading } = useQuery<OeElement>({
    queryKey: ["/api/oe-elements", id],
    enabled: isEditMode && !!id,
  });

  // Update form data when existing element loads
  useEffect(() => {
    if (existingElement && isEditMode) {
      setFormData({
        elementNumber: existingElement.elementNumber,
        title: existingElement.title || "",
        description: existingElement.description || "",
        icon: existingElement.icon || "📋",
        color: existingElement.color || "#3B82F6",
        isActive: existingElement.isActive ?? true,
      });
    }
  }, [existingElement, isEditMode]);

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

  const saveElementMutation = useMutation({
    mutationFn: async (data: ElementFormData) => {
      if (isEditMode) {
        return await apiRequest("PUT", `/api/oe-elements/${id}`, data);
      } else {
        return await apiRequest("POST", "/api/oe-elements", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `OE Element ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/oe-elements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/oe-elements", id] });
      }
      setLocation(isEditMode ? `/element/${id}` : "/");
    },
    onError: (error) => {
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
        description: `Failed to ${isEditMode ? 'update' : 'create'} OE element`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Element title is required",
        variant: "destructive",
      });
      return;
    }
    saveElementMutation.mutate(formData);
  };

  const handleCancel = () => {
    setLocation(isEditMode ? `/element/${id}` : "/");
  };

  if (isLoading || (!isAuthenticated && !isLoading) || (isEditMode && elementLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild data-testid="button-back">
                  <Link href={isEditMode ? `/element/${id}` : "/"}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold" data-testid="element-editor-title">
                    {isEditMode ? 'Edit OE Element' : 'Create New OE Element'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isEditMode 
                      ? 'Modify the Operational Excellence element details' 
                      : 'Add a new Operational Excellence element to the framework'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Element Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="elementNumber">Element Number</Label>
                      <Input
                        id="elementNumber"
                        type="number"
                        min={1}
                        value={formData.elementNumber}
                        onChange={(e) => setFormData({ ...formData, elementNumber: parseInt(e.target.value) || 1 })}
                        data-testid="input-element-number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) => setFormData({ ...formData, icon: value })}
                      >
                        <SelectTrigger data-testid="select-icon">
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Element Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter element title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      data-testid="input-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose and scope of this OE element..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        data-testid="input-color"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        data-testid="switch-active"
                      />
                      <Label htmlFor="isActive">Active Element</Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      data-testid="button-cancel"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveElementMutation.isPending}
                      data-testid="button-save"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveElementMutation.isPending 
                        ? (isEditMode ? "Updating..." : "Creating...") 
                        : (isEditMode ? "Update Element" : "Create Element")
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}