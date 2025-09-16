import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Circle, 
  Diamond, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw 
} from 'lucide-react';

interface ProcessStep {
  id: string;
  stepNumber: number;
  stepType?: string; // task, decision, start, end
  stepName: string;
  stepDetails?: string;
}

interface ProcessStepEdge {
  id: string;
  fromStepId: string;
  toStepId: string;
  label: string | null;
  priority: number;
}

interface ProcessGraph {
  nodes: ProcessStep[];
  edges: ProcessStepEdge[];
}

interface DecisionTreeVisualizationProps {
  graph: ProcessGraph;
}

interface NodePosition {
  x: number;
  y: number;
  level: number;
}

interface TreeNode {
  step: ProcessStep;
  children: TreeNode[];
  edges: ProcessStepEdge[];
  position: NodePosition;
}

function buildTree(graph: ProcessGraph): TreeNode[] {
  const { nodes, edges } = graph;
  
  // Find root nodes (steps with no incoming edges)
  const incomingEdges = new Set(edges.map(e => e.toStepId));
  const rootSteps = nodes.filter(step => !incomingEdges.has(step.id));
  
  // Build adjacency list
  const adjacencyList = new Map<string, { edge: ProcessStepEdge; step: ProcessStep }[]>();
  edges.forEach(edge => {
    const fromStep = nodes.find(s => s.id === edge.fromStepId);
    const toStep = nodes.find(s => s.id === edge.toStepId);
    if (fromStep && toStep) {
      if (!adjacencyList.has(edge.fromStepId)) {
        adjacencyList.set(edge.fromStepId, []);
      }
      adjacencyList.get(edge.fromStepId)?.push({ edge, step: toStep });
    }
  });
  
  // Sort children by priority
  adjacencyList.forEach(children => {
    children.sort((a, b) => a.edge.priority - b.edge.priority);
  });
  
  // Build tree structure with positions
  function buildNode(step: ProcessStep, level: number = 0): TreeNode {
    const children = adjacencyList.get(step.id) || [];
    
    return {
      step,
      children: children.map(({ step: childStep }) => buildNode(childStep, level + 1)),
      edges: children.map(({ edge }) => edge),
      position: { x: 0, y: 0, level } // Will be calculated later
    };
  }
  
  return rootSteps.map(step => buildNode(step));
}

function calculatePositions(roots: TreeNode[]): void {
  const levelCounts = new Map<number, number>();
  const levelPositions = new Map<number, number>();
  
  // First pass: count nodes per level
  function countLevels(node: TreeNode) {
    const count = levelCounts.get(node.position.level) || 0;
    levelCounts.set(node.position.level, count + 1);
    node.children.forEach(countLevels);
  }
  
  roots.forEach(countLevels);
  
  // Second pass: assign positions
  function assignPositions(node: TreeNode, parentX: number = 0) {
    const level = node.position.level;
    const levelPos = levelPositions.get(level) || 0;
    const totalAtLevel = levelCounts.get(level) || 1;
    
    // Calculate x position based on level position and parent
    let x: number;
    if (level === 0) {
      x = 400; // Center root nodes
    } else if (node.step.stepType === 'decision' && node.children.length > 1) {
      // Decision nodes: spread children around parent
      x = parentX + (levelPos - totalAtLevel / 2) * 200;
    } else {
      x = parentX;
    }
    
    node.position.x = Math.max(50, x);
    node.position.y = level * 150 + 50;
    
    levelPositions.set(level, levelPos + 1);
    
    // Recursively position children
    node.children.forEach((child, index) => {
      if (node.children.length > 1) {
        // Spread children horizontally for decision nodes
        const childX = node.position.x + (index - (node.children.length - 1) / 2) * 300;
        assignPositions(child, childX);
      } else {
        assignPositions(child, node.position.x);
      }
    });
  }
  
  roots.forEach(root => assignPositions(root));
}

function StepNode({ node, zoom }: { node: TreeNode; zoom: number }) {
  const { step, position } = node;
  const isDecision = step.stepType === 'decision';
  
  return (
    <div
      className="absolute transition-all duration-200"
      style={{
        left: `${position.x * zoom}px`,
        top: `${position.y * zoom}px`,
        transform: `translate(-50%, -50%) scale(${zoom})`,
        transformOrigin: 'center'
      }}
      data-testid={`step-node-${step.stepNumber}`}
    >
      <Card className={`w-48 ${isDecision 
        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700' 
        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'}`}>
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            {isDecision ? (
              <Diamond className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {step.stepNumber}
                </Badge>
                <Badge 
                  variant={isDecision ? "destructive" : "default"} 
                  className="text-xs"
                >
                  {step.stepType}
                </Badge>
              </div>
              <h4 className="font-medium text-sm leading-tight mb-1">
                {step.stepName}
              </h4>
              {step.stepDetails && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {step.stepDetails}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EdgeLine({ from, to, label, zoom }: { 
  from: NodePosition; 
  to: NodePosition; 
  label: string | null;
  zoom: number;
}) {
  const dx = (to.x - from.x) * zoom;
  const dy = (to.y - from.y) * zoom;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${from.x * zoom}px`,
        top: `${from.y * zoom}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%'
      }}
    >
      <div className="h-0.5 bg-gray-400 dark:bg-gray-600 relative">
        <ArrowRight className="w-3 h-3 absolute -right-1 -top-1 text-gray-400 dark:text-gray-600" />
        {label && (
          <div 
            className="absolute top-1 bg-white dark:bg-gray-800 px-1 py-0.5 text-xs border rounded shadow-sm"
            style={{ left: `${length / 2 - 20}px` }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export function DecisionTreeVisualization({ graph }: DecisionTreeVisualizationProps) {
  const [zoom, setZoom] = useState(1);
  
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Diamond className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No decision tree data to display</p>
      </div>
    );
  }
  
  const trees = buildTree(graph);
  calculatePositions(trees);
  
  // Calculate container dimensions
  let maxX = 0, maxY = 0;
  function getMaxDimensions(node: TreeNode) {
    maxX = Math.max(maxX, node.position.x + 150);
    maxY = Math.max(maxY, node.position.y + 100);
    node.children.forEach(getMaxDimensions);
  }
  trees.forEach(getMaxDimensions);
  
  const containerWidth = Math.max(800, maxX * zoom);
  const containerHeight = Math.max(600, maxY * zoom);
  
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Badge variant="secondary">{Math.round(zoom * 100)}%</Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setZoom(z => Math.min(2, z + 0.25))}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setZoom(1)}
          data-testid="button-reset-zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Decision Tree Canvas */}
      <div className="border rounded-lg bg-white dark:bg-gray-900 overflow-auto" data-testid="decision-tree-canvas">
        <div 
          className="relative"
          style={{ 
            width: `${containerWidth}px`, 
            height: `${containerHeight}px`,
            minHeight: '400px'
          }}
        >
          {/* Render edges first (behind nodes) */}
          {trees.map(tree => {
            const edges: JSX.Element[] = [];
            
            function renderEdges(node: TreeNode) {
              node.children.forEach((child, index) => {
                const edge = node.edges[index];
                edges.push(
                  <EdgeLine
                    key={`edge-${node.step.id}-${child.step.id}`}
                    from={node.position}
                    to={child.position}
                    label={edge?.label || null}
                    zoom={zoom}
                  />
                );
                renderEdges(child);
              });
            }
            
            renderEdges(tree);
            return edges;
          })}
          
          {/* Render nodes */}
          {trees.map(tree => {
            const nodes: JSX.Element[] = [];
            
            function renderNodes(node: TreeNode) {
              nodes.push(
                <StepNode key={node.step.id} node={node} zoom={zoom} />
              );
              node.children.forEach(renderNodes);
            }
            
            renderNodes(tree);
            return nodes;
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Circle className="w-4 h-4 text-blue-600" />
          <span>Task Step</span>
        </div>
        <div className="flex items-center space-x-2">
          <Diamond className="w-4 h-4 text-orange-600" />
          <span>Decision Step</span>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowRight className="w-4 h-4" />
          <span>Flow Direction</span>
        </div>
      </div>
    </div>
  );
}