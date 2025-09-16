import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Trash2, 
  Save, 
  Crown, 
  DollarSign, 
  Cog, 
  Shield, 
  Activity, 
  GraduationCap,
  MoveUp,
  MoveDown,
  Target,
  BarChart3,
  Paperclip,
  FileText,
  Download
} from "lucide-react";
import type { OeProcessWithDetails, OeElementWithProcesses, StrategicGoal, ProcessDocument } from "@shared/schema";
import FileUpload from "@/components/file-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema
const processFormSchema = z.object({
  elementId: z.string().min(1, "Please select an OE element"),
  processNumber: z.string().min(1, "Process number is required"),
  name: z.string().min(1, "Process name is required"),
  description: z.string().optional(),
  processOwner: z.string().optional(),
  processType: z.enum(["sequential", "decisionTree"]).default("sequential"),
  status: z.enum(["draft", "active", "review", "archived"]).default("draft"),
  isMandatory: z.boolean().default(false),
  expectations: z.string().optional(),
  inputToProcess: z.string().optional(),
  deliverable: z.string().optional(),
  criticalToProcessQuality: z.string().optional(),
  issueDate: z.string().optional(),
  // Risk Management fields
  riskFrequency: z.string().optional(),
  riskImpact: z.string().optional(),
  riskDescription: z.string().optional(),
  riskMitigation: z.string().optional(),
  steps: z.array(z.object({
    stepNumber: z.number().min(1),
    stepName: z.string().min(1, "Step name is required"),
    stepDetails: z.string().optional(),
    responsibilities: z.string().optional(),
    references: z.string().optional(),
    stepType: z.enum(["task", "decision", "start", "end"]).default("task"),
    outcomes: z.array(z.object({
      label: z.string().min(1, "Outcome label is required"),
      toStepNumber: z.number().min(1, "Target step number is required"),
      priority: z.number().default(0),
    })).optional().default([]),
  })).default([]),
  performanceMeasures: z.array(z.object({
    measureName: z.string().min(1, "Measure name is required"),
    formula: z.string().optional(),
    source: z.string().optional(),
    frequency: z.string().optional(),
    target: z.string().optional(),
    scorecardCategory: z.string().optional(),
    strategicGoalId: z.string().optional(),
  })).default([]),
  fileAttachments: z.array(z.object({
    title: z.string().min(1, "File title is required"),
    description: z.string().optional(),
    fileName: z.string().optional(),
    fileUrl: z.string().optional(),
    fileSize: z.number().optional(),
  })).default([]),
});

type ProcessFormData = z.infer<typeof processFormSchema>;

interface ProcessFormProps {
  process?: OeProcessWithDetails;
  elements: OeElementWithProcesses[];
  isLoading: boolean;
  onSubmit: (data: ProcessFormData) => void;
  onCancel: () => void;
}

// File attachment interface for display
interface AttachmentDisplay {
  id: string;
  title: string;
  fileName: string;
  fileSize?: number;
  fileUrl: string;
  createdAt?: string;
}

export default function ProcessForm({ 
  process, 
  elements, 
  isLoading, 
  onSubmit, 
  onCancel 
}: ProcessFormProps) {
  const [selectedElementId, setSelectedElementId] = useState<string>(process?.elementId || "");
  const [attachments, setAttachments] = useState<AttachmentDisplay[]>([]);
  const queryClient = useQueryClient();

  // Load strategic goals for the dropdown
  const { data: strategicGoals = [], isLoading: isLoadingGoals, error: goalsError } = useQuery<StrategicGoal[]>({
    queryKey: ["/api/strategic-goals"],
  });

  // Debug logs
  if (goalsError) {
    console.error("Strategic Goals API Error:", goalsError);
  }

  // Load existing attachments for this process
  const { data: documents = [] } = useQuery<ProcessDocument[]>({
    queryKey: [`/api/processes/${process?.id}/documents`],
    enabled: !!process?.id,
  });

  // Update attachments when documents change
  useEffect(() => {
    if (documents) {
      setAttachments(documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileSize: doc.fileSize || undefined,
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt?.toString(),
      })));
    }
  }, [documents]);

  // Delete attachment mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/processes/${process?.id}/documents`]
      });
    },
  });

  const form = useForm<ProcessFormData>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      elementId: process?.elementId || "",
      processNumber: process?.processNumber || "",
      name: process?.name || "",
      description: process?.description || "",
      processOwner: process?.processOwner || "",
      processType: (process as any)?.processType || "sequential",
      status: (process?.status as any) || "draft",
      isMandatory: process?.isMandatory || false,
      expectations: process?.expectations || "",
      inputToProcess: process?.inputToProcess || "",
      deliverable: process?.deliverable || "",
      criticalToProcessQuality: process?.criticalToProcessQuality || "",
      issueDate: process?.issueDate ? new Date(process.issueDate).toISOString().split('T')[0] : "",
      // Risk Management fields
      riskFrequency: process?.riskFrequency || "",
      riskImpact: process?.riskImpact || "",
      riskDescription: process?.riskDescription || "",
      riskMitigation: process?.riskMitigation || "",
      steps: process?.steps?.map(step => ({
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        stepDetails: step.stepDetails || "",
        responsibilities: step.responsibilities || "",
        references: step.references || "",
        stepType: (step as any).stepType || "task",
        outcomes: [],
      })) || [],
      performanceMeasures: process?.performanceMeasures?.map(measure => ({
        measureName: measure.measureName,
        formula: measure.formula || "",
        source: measure.source || "",
        frequency: measure.frequency || "",
        target: measure.target || "",
        scorecardCategory: measure.scorecardCategory || "",
        strategicGoalId: (measure as any).strategicGoalId || "none",
      })) || [],
      fileAttachments: attachments.map(attachment => ({
        title: attachment.title,
        description: "", // Description not stored in current schema
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileSize: attachment.fileSize,
      })) || [],
    },
  });

  const { fields: stepFields, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const { fields: measureFields, append: appendMeasure, remove: removeMeasure } = useFieldArray({
    control: form.control,
    name: "performanceMeasures",
  });

  const { fields: fileFields, append: appendFile, remove: removeFile } = useFieldArray({
    control: form.control,
    name: "fileAttachments",
  });

  const getElementIcon = (elementNumber: number) => {
    switch (elementNumber) {
      case 1: return Crown;
      case 2: return Activity;
      case 3: return GraduationCap;
      case 4: return Cog;
      case 5: return Activity;
      case 6: return DollarSign;
      case 7: return Shield;
      case 8: return GraduationCap;
      default: return Activity;
    }
  };

  const getElementColor = (elementNumber: number) => {
    switch (elementNumber) {
      case 1: return "text-blue-600 bg-blue-100";
      case 2: return "text-indigo-600 bg-indigo-100";
      case 3: return "text-orange-600 bg-orange-100";
      case 4: return "text-purple-600 bg-purple-100";
      case 5: return "text-indigo-600 bg-indigo-100";
      case 6: return "text-green-600 bg-green-100";
      case 7: return "text-red-600 bg-red-100";
      case 8: return "text-orange-600 bg-orange-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const addStep = () => {
    const nextStepNumber = stepFields.length + 1;
    appendStep({
      stepNumber: nextStepNumber,
      stepName: "",
      stepDetails: "",
      responsibilities: "",
      references: "",
      stepType: "task",
      outcomes: [],
    });
  };

  const addMeasure = () => {
    appendMeasure({
      measureName: "",
      formula: "",
      source: "",
      frequency: "",
      target: "",
      scorecardCategory: "",
    });
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      moveStep(index, index - 1);
      // Update step numbers
      const steps = form.getValues("steps");
      steps[index - 1].stepNumber = index;
      steps[index].stepNumber = index + 1;
      form.setValue("steps", steps);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < stepFields.length - 1) {
      moveStep(index, index + 1);
      // Update step numbers
      const steps = form.getValues("steps");
      steps[index].stepNumber = index + 2;
      steps[index + 1].stepNumber = index + 1;
      form.setValue("steps", steps);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Element Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select OE Element</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="elementId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OE Element</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elements.map((element) => {
                      const Icon = getElementIcon(element.elementNumber);
                      const colorClass = getElementColor(element.elementNumber);
                      const isSelected = field.value === element.id;
                      
                      return (
                        <div
                          key={element.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? "border-primary bg-primary/5 ring-2 ring-primary ring-opacity-20" 
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            field.onChange(element.id);
                            setSelectedElementId(element.id);
                          }}
                          data-testid={`element-option-${element.elementNumber}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">OE Element No. {element.elementNumber}</h4>
                              <p className="text-sm text-muted-foreground">{element.title}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Process Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="processNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., OE-4.1" 
                        {...field} 
                        data-testid="input-process-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Asset Lifecycle Management" 
                        {...field} 
                        data-testid="input-process-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="processOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Owner</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-process-owner">
                          <SelectValue placeholder="Select Process Owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Department Head">Department Head</SelectItem>
                        <SelectItem value="Division Head">Division Head</SelectItem>
                        <SelectItem value="Unit Head">Unit Head</SelectItem>
                        <SelectItem value="Process Manager">Process Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-process-type">
                          <SelectValue placeholder="Select Process Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="decisionTree">Decision Tree</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-issue-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isMandatory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-mandatory"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mandatory Process
                      </FormLabel>
                      <FormDescription>
                        Mark this process as mandatory for compliance
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Describe the purpose and scope of this process..."
                      {...field} 
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expectations</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Define the expectations and objectives for this process..."
                      {...field} 
                      data-testid="textarea-expectations"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inputToProcess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input to Process</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Describe the inputs required for this process..."
                      {...field} 
                      data-testid="textarea-input-to-process"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliverable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deliverable</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Describe the deliverables and outputs of this process..."
                      {...field} 
                      data-testid="textarea-deliverable"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criticalToProcessQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critical To Process Quality</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Describe what is critical to the quality of this process..."
                      {...field} 
                      data-testid="textarea-critical-to-process-quality"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Process Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Process Steps</span>
              </CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addStep}
                data-testid="button-add-step"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No process steps defined yet.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addStep}
                  className="mt-2"
                  data-testid="button-add-first-step"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            ) : (
              stepFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4" data-testid={`step-${index}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-medium">Step {index + 1}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStepUp(index)}
                        disabled={index === 0}
                        data-testid={`button-move-step-up-${index}`}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStepDown(index)}
                        disabled={index === stepFields.length - 1}
                        data-testid={`button-move-step-down-${index}`}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(index)}
                        data-testid={`button-remove-step-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.stepName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Plan Strategic Direction" 
                              {...field} 
                              data-testid={`input-step-name-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.stepType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-step-type-${index}`}>
                                <SelectValue placeholder="Select Step Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="task">Task</SelectItem>
                              <SelectItem value="decision">Decision</SelectItem>
                              <SelectItem value="start">Start</SelectItem>
                              <SelectItem value="end">End</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.responsibilities`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsible Party</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Department Head" 
                              {...field} 
                              data-testid={`input-step-responsibilities-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`steps.${index}.stepDetails`}
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Step Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={3}
                            placeholder="Describe how this step should be executed..."
                            {...field} 
                            data-testid={`textarea-step-details-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.references`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>References</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., SAEP-G-001, GI-002" 
                            {...field} 
                            data-testid={`input-step-references-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Decision Outcomes - Only show for decision steps */}
                  {form.watch(`steps.${index}.stepType`) === 'decision' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-sm">Decision Outcomes</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentOutcomes = form.getValues(`steps.${index}.outcomes`) || [];
                            const maxStepNumber = stepFields.length;
                            form.setValue(`steps.${index}.outcomes`, [
                              ...currentOutcomes,
                              {
                                label: "",
                                toStepNumber: maxStepNumber > 1 ? maxStepNumber : 1,
                                priority: currentOutcomes.length,
                              }
                            ]);
                          }}
                          data-testid={`button-add-outcome-${index}`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Outcome
                        </Button>
                      </div>

                      {form.watch(`steps.${index}.outcomes`)?.map((outcome, outcomeIndex) => (
                        <div key={outcomeIndex} className="flex gap-2 mb-2">
                          <FormField
                            control={form.control}
                            name={`steps.${index}.outcomes.${outcomeIndex}.label`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Yes, No, Critical, Major" 
                                    {...field} 
                                    data-testid={`input-outcome-label-${index}-${outcomeIndex}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`steps.${index}.outcomes.${outcomeIndex}.toStepNumber`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-outcome-step-${index}-${outcomeIndex}`}>
                                      <SelectValue placeholder="Step" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {stepFields.map((_, stepIdx) => (
                                      <SelectItem key={stepIdx} value={(stepIdx + 1).toString()}>
                                        Step {stepIdx + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentOutcomes = form.getValues(`steps.${index}.outcomes`) || [];
                              const newOutcomes = currentOutcomes.filter((_, idx) => idx !== outcomeIndex);
                              form.setValue(`steps.${index}.outcomes`, newOutcomes);
                            }}
                            data-testid={`button-remove-outcome-${index}-${outcomeIndex}`}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}

                      {(!form.watch(`steps.${index}.outcomes`) || form.watch(`steps.${index}.outcomes`)?.length === 0) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Add outcomes to define the possible paths from this decision step.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Performance Measures */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Performance Measures</span>
              </CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addMeasure}
                data-testid="button-add-measure"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Measure
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {measureFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No performance measures defined yet.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addMeasure}
                  className="mt-2"
                  data-testid="button-add-first-measure"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Measure
                </Button>
              </div>
            ) : (
              measureFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4" data-testid={`measure-${index}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Performance Measure {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMeasure(index)}
                      data-testid={`button-remove-measure-${index}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.measureName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measure Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Process Completion Rate" 
                              {...field} 
                              data-testid={`input-measure-name-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.formula`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formula</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., (Completed / Total) * 100" 
                              {...field} 
                              data-testid={`input-measure-formula-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.source`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Organization Database" 
                              {...field} 
                              data-testid={`input-measure-source-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Monthly" 
                              {...field} 
                              data-testid={`input-measure-frequency-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.target`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 95%" 
                              {...field} 
                              data-testid={`input-measure-target-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.scorecardCategory`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scorecard Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-scorecard-category-${index}`}>
                                <SelectValue placeholder="Select scorecard category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Financial">Financial</SelectItem>
                              <SelectItem value="Customer">Customer</SelectItem>
                              <SelectItem value="Internal Process">Internal Process</SelectItem>
                              <SelectItem value="Learning & Growth">Learning & Growth</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`performanceMeasures.${index}.strategicGoalId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link to Strategic Goal (Optional)</FormLabel>
                          {goalsError && (
                            <div className="text-sm text-red-600 mb-2">
                              Error loading strategic goals. Please refresh the page.
                            </div>
                          )}
                          {isLoadingGoals && (
                            <div className="text-sm text-muted-foreground mb-2">
                              Loading strategic goals...
                            </div>
                          )}
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingGoals}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-strategic-goal-${index}`}>
                                <SelectValue placeholder={
                                  isLoadingGoals 
                                    ? "Loading goals..." 
                                    : goalsError 
                                    ? "Error loading goals" 
                                    : "Select a strategic goal"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No linked goal</SelectItem>
                              {strategicGoals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                  {goal.title} ({goal.category})
                                </SelectItem>
                              ))}
                              {strategicGoals.length === 0 && !isLoadingGoals && !goalsError && (
                                <SelectItem value="no-goals" disabled>
                                  No strategic goals available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Risk Management</span>
              </CardTitle>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Auto-populate comprehensive risk assessment based on process context
                  const processName = form.getValues("name");
                  const processType = processName.toLowerCase();
                  
                  let riskFrequency = "Medium";
                  let riskImpact = "Medium";
                  let riskDescription = "";
                  let riskMitigation = "";
                  
                  // Determine risk profile based on process type
                  if (processType.includes("financial") || processType.includes("budget") || processType.includes("payment")) {
                    riskFrequency = "High";
                    riskImpact = "High";
                    riskDescription = "Risk of financial fraud, errors in transactions, budget overruns, compliance violations, system failures affecting payments, and potential regulatory penalties.";
                    riskMitigation = "• Implement dual approval controls for all financial transactions\n• Conduct monthly financial audits and reconciliations\n• Establish segregation of duties between authorization and recording\n• Maintain backup financial systems and data recovery procedures\n• Train staff on financial compliance and fraud detection";
                  } else if (processType.includes("safety") || processType.includes("security") || processType.includes("emergency")) {
                    riskFrequency = "Medium";
                    riskImpact = "High";
                    riskDescription = "Risk of workplace accidents, security breaches, emergency response failures, equipment malfunctions, and potential harm to personnel or property.";
                    riskMitigation = "• Conduct regular safety inspections and risk assessments\n• Implement comprehensive emergency response procedures\n• Provide ongoing safety training and certification programs\n• Maintain updated emergency contacts and communication systems\n• Establish clear escalation protocols for incidents";
                  } else if (processType.includes("customer") || processType.includes("service") || processType.includes("support")) {
                    riskFrequency = "Medium";
                    riskImpact = "Medium";
                    riskDescription = "Risk of customer dissatisfaction, service delivery failures, communication breakdowns, response time delays, and potential reputation damage.";
                    riskMitigation = "• Implement customer feedback monitoring and response systems\n• Establish service level agreements with clear performance metrics\n• Provide regular customer service training to staff\n• Maintain backup communication channels for service delivery\n• Develop customer escalation and complaint resolution procedures";
                  } else if (processType.includes("technology") || processType.includes("IT") || processType.includes("system")) {
                    riskFrequency = "High";
                    riskImpact = "High";
                    riskDescription = "Risk of system failures, cybersecurity breaches, data loss, software vulnerabilities, hardware malfunctions, and business continuity disruptions.";
                    riskMitigation = "• Implement robust cybersecurity measures and access controls\n• Conduct regular system backups and disaster recovery testing\n• Maintain updated software and security patches\n• Establish IT support protocols and vendor management\n• Monitor system performance and capacity planning";
                  } else if (processType.includes("compliance") || processType.includes("audit") || processType.includes("regulatory")) {
                    riskFrequency = "Medium";
                    riskImpact = "High";
                    riskDescription = "Risk of regulatory non-compliance, audit failures, legal penalties, documentation gaps, and potential sanctions from regulatory bodies.";
                    riskMitigation = "• Stay updated on regulatory changes and compliance requirements\n• Conduct regular internal compliance audits and assessments\n• Maintain comprehensive documentation and record keeping\n• Provide ongoing compliance training to relevant staff\n• Establish relationships with regulatory bodies and advisors";
                  } else if (processType.includes("human") || processType.includes("HR") || processType.includes("personnel")) {
                    riskFrequency = "Medium";
                    riskImpact = "Medium";
                    riskDescription = "Risk of employee disputes, hiring mistakes, performance issues, workplace conflicts, data privacy breaches, and potential legal claims.";
                    riskMitigation = "• Implement fair and consistent HR policies and procedures\n• Conduct thorough background checks and reference verification\n• Provide regular training on workplace policies and procedures\n• Maintain confidential employee records and data protection\n• Establish clear performance management and disciplinary procedures";
                  } else if (processType.includes("quality") || processType.includes("control") || processType.includes("assurance")) {
                    riskFrequency = "Medium";
                    riskImpact = "High";
                    riskDescription = "Risk of quality defects, product failures, customer complaints, regulatory non-compliance, and potential recalls or liability issues.";
                    riskMitigation = "• Implement systematic quality control checkpoints and testing\n• Conduct regular quality audits and performance reviews\n• Maintain detailed quality documentation and traceability\n• Provide ongoing quality training and certification\n• Establish corrective and preventive action procedures";
                  } else {
                    // Default generic risk description and mitigation
                    riskDescription = "Risk of process failures, resource constraints, communication gaps, performance issues, and potential operational disruptions.";
                    riskMitigation = "• Conduct regular process reviews and performance monitoring\n• Implement appropriate controls and approval mechanisms\n• Provide adequate training and resources to process owners\n• Maintain clear documentation and standard operating procedures\n• Establish contingency plans for process disruptions\n• Monitor key performance indicators and risk metrics\n• Ensure adequate communication and escalation procedures";
                  }
                  
                  form.setValue("riskFrequency", riskFrequency);
                  form.setValue("riskImpact", riskImpact);
                  form.setValue("riskDescription", riskDescription);
                  form.setValue("riskMitigation", riskMitigation);
                }}
                data-testid="button-add-risk"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="riskFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-risk-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="riskImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Impact</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-risk-impact">
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="riskDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the potential risks associated with this process..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-risk-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="riskMitigation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Mitigation Strategy</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the strategy to mitigate this risk..."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-risk-mitigation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Paperclip className="w-5 h-5" />
                <span>File Attachments</span>
              </CardTitle>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFile({ 
                  title: "", 
                  description: "",
                  fileName: "",
                  fileUrl: "",
                  fileSize: 0
                })}
                data-testid="button-add-file"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add File
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fileFields.length > 0 ? (
              <div className="space-y-6">
                {fileFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">File {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`fileAttachments.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Process Documentation" 
                                {...field} 
                                data-testid={`input-file-title-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        {process?.id && (
                          <FileUpload 
                            processId={process.id} 
                            onUploadComplete={() => {
                              // Refresh documents after upload
                              queryClient.invalidateQueries({ 
                                queryKey: [`/api/processes/${process.id}/documents`]
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name={`fileAttachments.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={2}
                              placeholder="Describe what this file contains..."
                              {...field} 
                              data-testid={`textarea-file-description-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Show file info if uploaded */}
                    {form.watch(`fileAttachments.${index}.fileName`) && (
                      <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {form.watch(`fileAttachments.${index}.fileName`)}
                          </p>
                          {form.watch(`fileAttachments.${index}.fileSize`) && (
                            <p className="text-xs text-muted-foreground">
                              {((form.watch(`fileAttachments.${index}.fileSize`) || 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {form.watch(`fileAttachments.${index}.fileUrl`) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              asChild
                              data-testid={`button-download-file-${index}`}
                            >
                              <a
                                href={form.watch(`fileAttachments.${index}.fileUrl`)}
                                download={form.watch(`fileAttachments.${index}.fileName`)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No file attachments added yet</p>
                <p className="text-xs">
                  Click "Add File" to attach documents, images, or other files to this process.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel-form"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              const formData = form.getValues();
              onSubmit({ ...formData, status: "draft" });
            }}
            disabled={isLoading}
            data-testid="button-save-draft"
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-submit-form"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                {process ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {process ? 'Update Process' : 'Create Process'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
