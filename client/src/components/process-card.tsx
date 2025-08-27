import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  DollarSign, 
  Cog, 
  Shield, 
  Activity, 
  GraduationCap, 
  MoreVertical,
  Star 
} from "lucide-react";
import MiniProcessFlow from "@/components/mini-process-flow";
import type { OeElementWithProcesses } from "@shared/schema";

interface ProcessCardProps {
  element: OeElementWithProcesses;
  viewMode?: "grid" | "list";
}

export default function ProcessCard({ element, viewMode = "grid" }: ProcessCardProps) {
  const getElementIcon = (elementNumber: number) => {
    // If element has a custom icon, use it, otherwise fallback to default icons
    if (element.icon) {
      return null; // We'll render the emoji directly
    }
    
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

  const getStatusColor = (processCount: number) => {
    if (processCount === 0) return 'bg-gray-100 text-gray-800';
    if (processCount <= 2) return 'bg-yellow-100 text-yellow-800';
    if (processCount <= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (processCount: number) => {
    if (processCount === 0) return 'No Processes';
    if (processCount <= 2) return 'Getting Started';
    if (processCount <= 4) return 'In Progress';
    return 'Active';
  };

  const processCount = element.processes?.length || 0;
  const activeProcesses = element.processes?.filter(p => p.status === 'active').length || 0;
  const progressPercentage = processCount > 0 ? Math.round((activeProcesses / processCount) * 100) : 0;
  
  const Icon = getElementIcon(element.elementNumber);
  const iconColorClass = getElementColor(element.elementNumber);
  const statusColor = getStatusColor(processCount);
  const statusText = getStatusText(processCount);

  // Find if this is a featured element (e.g., Asset Management)
  const isFeatured = element.elementNumber === 4;

  if (viewMode === "list") {
    return (
      <Link href={`/element/${element.id}`}>
        <Card 
          className={`process-card cursor-pointer transition-all duration-200 hover:shadow-md ${
            isFeatured ? 'border-l-4 border-l-primary' : ''
          }`}
          data-testid={`process-card-${element.elementNumber}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                  {element.icon ? (
                    <span className="text-2xl">{element.icon}</span>
                  ) : Icon ? (
                    <Icon className="text-xl" />
                  ) : (
                    <Activity className="text-xl" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold" data-testid="element-title">
                      OE Element No. {element.elementNumber}
                    </h3>
                    {isFeatured && (
                      <Star className="w-4 h-4 text-primary fill-current" />
                    )}
                  </div>
                  <h4 className="text-primary font-medium mb-1" data-testid="element-name">
                    {element.title}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid="element-description">
                    {element.description || 'No description available'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="font-medium" data-testid="process-count">
                    {processCount}
                  </div>
                  <div>Process{processCount !== 1 ? 'es' : ''}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium" data-testid="progress-percentage">
                    {progressPercentage}%
                  </div>
                  <div>Complete</div>
                </div>
                <Badge className={statusColor}>
                  {statusText}
                </Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="button-element-menu">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/element/${element.id}`}>
      <Card 
        className={`process-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
          isFeatured ? 'border-2 border-primary relative' : ''
        }`}
        data-testid={`process-card-${element.elementNumber}`}
      >
        {isFeatured && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Star className="text-primary-foreground text-sm fill-current" />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClass}`}>
              {element.icon ? (
                <span className="text-2xl">{element.icon}</span>
              ) : Icon ? (
                <Icon className="text-xl" />
              ) : (
                <Activity className="text-xl" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColor}>
                {statusText}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="button-element-menu">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2" data-testid="element-title">
            OE Element No. {element.elementNumber}
          </h3>
          <h4 className="text-primary font-medium mb-3" data-testid="element-name">
            {element.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid="element-description">
            {element.description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground" data-testid="process-count">
              {processCount} Process{processCount !== 1 ? 'es' : ''}
            </span>
            <span className="text-muted-foreground" data-testid="last-updated">
              Last updated: {
                element.updatedAt 
                  ? new Date(element.updatedAt).toLocaleDateString()
                  : 'Never'
              }
            </span>
          </div>
          
          {/* Process Flow Preview */}
          {element.processes && element.processes.length > 0 && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Process Overview
              </div>
              <div className="space-y-2">
                {element.processes.slice(0, 2).map((process) => (
                  <div key={process.id} className="text-xs">
                    <MiniProcessFlow 
                      processNumber={process.processNumber}
                      steps={[]}
                      compact={true}
                    />
                  </div>
                ))}
                {element.processes.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{element.processes.length - 2} more processes
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium" data-testid="progress-percentage">
                {progressPercentage}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              data-testid="progress-bar"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
