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


  if (viewMode === "list") {
    return (
      <Link href={`/element/${element.id}`}>
        <Card 
          className="process-card cursor-pointer transition-all duration-200 hover:shadow-md"
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
                  </div>
                  <h4 className="text-primary font-medium mb-1" data-testid="element-name">
                    {element.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-4" data-testid="element-description">
                    {element.description || 'No description available'}
                  </p>
                  
                  {/* Enabling Elements Display for List View */}
                  {(element as any).enablingElements && (element as any).enablingElements.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Enabling Elements:</div>
                      <div className="flex flex-wrap gap-1">
                        {(element as any).enablingElements.slice(0, 4).map((enabledElement: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-2 py-0"
                            data-testid={`list-enabling-element-${index}`}
                          >
                            {enabledElement}
                          </Badge>
                        ))}
                        {(element as any).enablingElements.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{(element as any).enablingElements.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
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
                  <div className="font-medium" data-testid="metrics-count">
                    {element.performanceMetrics?.length || 0}
                  </div>
                  <div>Metrics</div>
                </div>
                <div className="text-center">
                  <div className="font-medium" data-testid="risks-count">
                    {(element.processes || []).reduce((total, process) => {
                      return total + (process.riskDescription ? 1 : 0);
                    }, 0)}
                  </div>
                  <div>Risks</div>
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
        className="process-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        data-testid={`process-card-${element.elementNumber}`}
      >
        
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
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3" data-testid="element-description">
            {element.description || 'No description available'}
          </p>
          
          {/* Enabling Elements Display */}
          {(element as any).enablingElements && (element as any).enablingElements.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Enabling Elements:</div>
              <div className="flex flex-wrap gap-1">
                {(element as any).enablingElements.slice(0, 3).map((enabledElement: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-2 py-0"
                    data-testid={`card-enabling-element-${index}`}
                  >
                    {enabledElement}
                  </Badge>
                ))}
                {(element as any).enablingElements.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{(element as any).enablingElements.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground" data-testid="last-updated">
              Last updated: {
                element.updatedAt 
                  ? new Date(element.updatedAt).toLocaleDateString()
                  : 'Never'
              }
            </span>
          </div>
          
          {/* Metrics and Risks Summary */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
            <div>
              <div className="font-medium" data-testid="process-count">
                {processCount}
              </div>
              <div className="text-muted-foreground">Process{processCount !== 1 ? 'es' : ''}</div>
            </div>
            <div>
              <div className="font-medium" data-testid="metrics-count">
                {element.performanceMetrics?.length || 0}
              </div>
              <div className="text-muted-foreground">Metrics</div>
            </div>
            <div>
              <div className="font-medium" data-testid="risks-count">
                {(element.processes || []).reduce((total, process) => {
                  return total + (process.riskDescription ? 1 : 0);
                }, 0)}
              </div>
              <div className="text-muted-foreground">Risks</div>
            </div>
          </div>
          
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
