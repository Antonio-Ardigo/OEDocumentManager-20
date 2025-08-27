import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  BarChart3
} from "lucide-react";
import type { OeProcessWithDetails, OeElementWithProcesses } from "@shared/schema";

// Form validation schema
const processFormSchema = z.object({
  elementId: z.string().min(1, "Please select an OE element"),
  processNumber: z.string().min(1, "Process number is required"),
  name: z.string().min(1, "Process name is required"),
  description: z.string().optional(),
  processOwner: z.string().optional(),
  status: z.enum(["draft", "active", "review", "archived"]).default("draft"),
  isMandatory: z.boolean().default(false),
  expectations: z.string().optional(),
  issueDate: z.string().optional(),
  steps: z.array(z.object({
    stepNumber: z.number().min(1),
    stepName: z.string().min(1, "Step name is required"),
    stepDetails: z.string().optional(),
    responsibilities: z.string().optional(),
    references: z.string().optional(),
  })).default([]),
  performanceMeasures: z.array(z.object({
    measureName: z.string().min(1, "Measure name is required"),
    formula: z.string().optional(),
    source: z.string().optional(),
    frequency: z.string().optional(),
    target: z.string().optional(),
    scorecardCategory: z.string().optional(),
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

export default function ProcessForm({ 
  process, 
  elements, 
  isLoading, 
  onSubmit, 
  onCancel 
}: ProcessFormProps) {
  const [selectedElementId, setSelectedElementId] = useState<string>(process?.elementId || "");

  const form = useForm<ProcessFormData>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      elementId: process?.elementId || "",
      processNumber: process?.processNumber || "",
      name: process?.name || "",
      description: process?.description || "",
      processOwner: process?.processOwner || "",
      status: (process?.status as any) || "draft",
      isMandatory: process?.isMandatory || false,
      expectations: process?.expectations || "",
      issueDate: process?.issueDate ? new Date(process.issueDate).toISOString().split('T')[0] : "",
      steps: process?.steps?.map(step => ({
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        stepDetails: step.stepDetails || "",
        responsibilities: step.responsibilities || "",
        references: step.references || "",
      })) || [],
      performanceMeasures: process?.performanceMeasures?.map(measure => ({
        measureName: measure.measureName,
        formula: measure.formula || "",
        source: measure.source || "",
        frequency: measure.frequency || "",
        target: measure.target || "",
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                </div>
              ))
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
