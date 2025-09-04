import {
  users,
  oeElements,
  oeProcesses,
  processSteps,
  performanceMeasures,
  documentVersions,
  strategicGoals,
  elementPerformanceMetrics,
  type User,
  type UpsertUser,
  type OeElement,
  type InsertOeElement,
  type OeProcess,
  type InsertOeProcess,
  type ProcessStep,
  type InsertProcessStep,
  type PerformanceMeasure,
  type InsertPerformanceMeasure,
  type DocumentVersion,
  type InsertDocumentVersion,
  type StrategicGoal,
  type InsertStrategicGoal,
  type ElementPerformanceMetric,
  type InsertElementPerformanceMetric,
  type ActivityLog,
  type InsertActivityLog,
  type OeProcessWithDetails,
  type OeElementWithProcesses,
  activityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, sql, asc, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // OE Element operations
  getAllOeElements(): Promise<OeElementWithProcesses[]>;
  getOeElement(id: string): Promise<OeElementWithProcesses | undefined>;
  createOeElement(element: InsertOeElement): Promise<OeElement>;
  updateOeElement(id: string, element: Partial<InsertOeElement>): Promise<OeElement>;
  deleteOeElement(id: string): Promise<void>;

  // OE Process operations
  getAllOeProcesses(filters?: {
    elementId?: string;
    status?: string;
    search?: string;
  }): Promise<OeProcessWithDetails[]>;
  getOeProcess(id: string): Promise<OeProcessWithDetails | undefined>;
  createOeProcess(process: InsertOeProcess): Promise<OeProcess>;
  updateOeProcess(id: string, process: Partial<InsertOeProcess>): Promise<OeProcess>;
  deleteOeProcess(id: string): Promise<void>;

  // Process Step operations
  getProcessSteps(processId: string): Promise<ProcessStep[]>;
  createProcessStep(step: InsertProcessStep): Promise<ProcessStep>;
  updateProcessStep(id: string, step: Partial<InsertProcessStep>): Promise<ProcessStep>;
  deleteProcessStep(id: string): Promise<void>;

  // Performance Measure operations
  getPerformanceMeasures(processId: string): Promise<PerformanceMeasure[]>;
  createPerformanceMeasure(measure: InsertPerformanceMeasure): Promise<PerformanceMeasure>;
  updatePerformanceMeasure(id: string, measure: Partial<InsertPerformanceMeasure>): Promise<PerformanceMeasure>;
  deletePerformanceMeasure(id: string): Promise<void>;

  // Document Version operations
  getDocumentVersions(processId: string): Promise<DocumentVersion[]>;
  createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion>;

  // Dashboard analytics
  getDashboardStats(): Promise<{
    totalProcesses: number;
    activeElements: number;
    pendingReviews: number;
    completionRate: number;
  }>;

  // Activity tracking operations
  getRecentActivity(limit?: number): Promise<(ActivityLog & { user?: User })[]>;
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;

  // Goals-to-Processes mind map operations
  getGoalsToProcessesMindMap(): Promise<any[]>;
}

// Helper function for natural alphanumeric sorting
function naturalSort(a: string, b: string): number {
  // Split both strings into arrays of alternating text and numbers
  const splitIntoTokens = (str: string) => {
    return str.match(/(\d+|\D+)/g) || [];
  };
  
  const tokensA = splitIntoTokens(a);
  const tokensB = splitIntoTokens(b);
  
  const maxLength = Math.max(tokensA.length, tokensB.length);
  
  for (let i = 0; i < maxLength; i++) {
    const tokenA = tokensA[i] || '';
    const tokenB = tokensB[i] || '';
    
    // If both tokens are numeric, compare as numbers
    const numA = parseFloat(tokenA);
    const numB = parseFloat(tokenB);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      // Compare as strings
      const comparison = tokenA.localeCompare(tokenB);
      if (comparison !== 0) {
        return comparison;
      }
    }
  }
  
  return 0;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // OE Element operations
  async getAllOeElements(): Promise<OeElementWithProcesses[]> {
    const elements = await db.query.oeElements.findMany({
      with: {
        processes: {
          with: {
            performanceMeasures: true,
          },
        },
      },
      orderBy: [oeElements.elementNumber],
    });
    
    // Sort processes using natural sorting
    elements.forEach(element => {
      if (element.processes) {
        element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
      }
    });
    
    return elements;
  }

  async getOeElementsForMindMap(): Promise<OeElementWithProcesses[]> {
    const elements = await db.query.oeElements.findMany({
      with: {
        processes: {
          with: {
            steps: {
              orderBy: [processSteps.stepNumber],
            },
          },
        },
      },
      orderBy: [oeElements.elementNumber],
    });
    
    // Sort processes using natural sorting
    elements.forEach(element => {
      if (element.processes) {
        element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
      }
    });
    
    return elements;
  }

  async getOeElement(id: string): Promise<OeElementWithProcesses | undefined> {
    const element = await db.query.oeElements.findFirst({
      where: eq(oeElements.id, id),
      with: {
        processes: {
          with: {
            steps: {
              orderBy: [processSteps.stepNumber],
            },
            performanceMeasures: {
              orderBy: [performanceMeasures.measureName],
            },
          },
        },
      },
    });
    
    // Sort processes using natural sorting
    if (element?.processes) {
      element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
    }
    
    return element;
  }

  async createOeElement(element: InsertOeElement): Promise<OeElement> {
    const [newElement] = await db
      .insert(oeElements)
      .values(element)
      .returning();
    return newElement;
  }

  async updateOeElement(id: string, element: Partial<InsertOeElement>): Promise<OeElement> {
    const [updatedElement] = await db
      .update(oeElements)
      .set({ ...element, updatedAt: new Date() })
      .where(eq(oeElements.id, id))
      .returning();
    return updatedElement;
  }

  async deleteOeElement(id: string): Promise<void> {
    await db.delete(oeElements).where(eq(oeElements.id, id));
  }

  // OE Process operations
  async getAllOeProcesses(filters?: {
    elementId?: string;
    status?: string;
    search?: string;
  }): Promise<OeProcessWithDetails[]> {
    const conditions = [];
    
    if (filters?.elementId) {
      conditions.push(eq(oeProcesses.elementId, filters.elementId));
    }
    
    if (filters?.status) {
      conditions.push(eq(oeProcesses.status, filters.status));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(oeProcesses.name, `%${filters.search}%`),
          ilike(oeProcesses.processNumber, `%${filters.search}%`),
          ilike(oeProcesses.description, `%${filters.search}%`)
        )
      );
    }

    const processes = await db.query.oeProcesses.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        element: true,
        steps: {
          orderBy: [processSteps.stepNumber],
        },
        performanceMeasures: true,
        versions: {
          orderBy: [desc(documentVersions.createdAt)],
          limit: 5,
        },
        createdByUser: true,
      },
    });
    
    // Sort processes using natural sorting
    processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
    
    return processes;
  }

  async getOeProcess(id: string): Promise<OeProcessWithDetails | undefined> {
    return await db.query.oeProcesses.findFirst({
      where: eq(oeProcesses.id, id),
      with: {
        element: true,
        steps: {
          orderBy: [processSteps.stepNumber],
        },
        performanceMeasures: true,
        versions: {
          orderBy: [desc(documentVersions.createdAt)],
        },
        createdByUser: true,
      },
    });
  }

  async createOeProcess(process: InsertOeProcess): Promise<OeProcess> {
    const [newProcess] = await db
      .insert(oeProcesses)
      .values(process)
      .returning();
    return newProcess;
  }

  async updateOeProcess(id: string, process: Partial<InsertOeProcess>): Promise<OeProcess> {
    const [updatedProcess] = await db
      .update(oeProcesses)
      .set({ ...process, updatedAt: new Date() })
      .where(eq(oeProcesses.id, id))
      .returning();
    return updatedProcess;
  }

  async deleteOeProcess(id: string): Promise<void> {
    await db.delete(oeProcesses).where(eq(oeProcesses.id, id));
  }

  // Process Step operations
  async getProcessSteps(processId: string): Promise<ProcessStep[]> {
    return await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.processId, processId))
      .orderBy(processSteps.stepNumber);
  }

  async createProcessStep(step: InsertProcessStep): Promise<ProcessStep> {
    const [newStep] = await db
      .insert(processSteps)
      .values(step)
      .returning();
    return newStep;
  }

  async updateProcessStep(id: string, step: Partial<InsertProcessStep>): Promise<ProcessStep> {
    const [updatedStep] = await db
      .update(processSteps)
      .set({ ...step, updatedAt: new Date() })
      .where(eq(processSteps.id, id))
      .returning();
    return updatedStep;
  }

  async deleteProcessStep(id: string): Promise<void> {
    await db.delete(processSteps).where(eq(processSteps.id, id));
  }

  // Performance Measure operations
  async getPerformanceMeasures(processId: string): Promise<PerformanceMeasure[]> {
    return await db
      .select()
      .from(performanceMeasures)
      .where(eq(performanceMeasures.processId, processId));
  }

  async createPerformanceMeasure(measure: InsertPerformanceMeasure): Promise<PerformanceMeasure> {
    const [newMeasure] = await db
      .insert(performanceMeasures)
      .values(measure)
      .returning();
    return newMeasure;
  }

  async updatePerformanceMeasure(id: string, measure: Partial<InsertPerformanceMeasure>): Promise<PerformanceMeasure> {
    const [updatedMeasure] = await db
      .update(performanceMeasures)
      .set({ ...measure, updatedAt: new Date() })
      .where(eq(performanceMeasures.id, id))
      .returning();
    return updatedMeasure;
  }

  async deletePerformanceMeasure(id: string): Promise<void> {
    await db.delete(performanceMeasures).where(eq(performanceMeasures.id, id));
  }

  // Strategic Goals operations
  async getAllStrategicGoals(): Promise<StrategicGoal[]> {
    return await db.select().from(strategicGoals).orderBy(strategicGoals.category, strategicGoals.priority);
  }

  async getStrategicGoalsByElement(elementId: string): Promise<StrategicGoal[]> {
    return await db
      .select()
      .from(strategicGoals)
      .where(eq(strategicGoals.elementId, elementId))
      .orderBy(strategicGoals.category, strategicGoals.priority);
  }

  async createStrategicGoal(goal: InsertStrategicGoal): Promise<StrategicGoal> {
    const [newGoal] = await db
      .insert(strategicGoals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateStrategicGoal(id: string, goal: Partial<InsertStrategicGoal>): Promise<StrategicGoal> {
    const [updatedGoal] = await db
      .update(strategicGoals)
      .set({ ...goal, updatedAt: new Date() })
      .where(eq(strategicGoals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteStrategicGoal(id: string): Promise<void> {
    await db.delete(strategicGoals).where(eq(strategicGoals.id, id));
  }

  // Element Performance Metrics operations
  async getAllElementPerformanceMetrics(): Promise<ElementPerformanceMetric[]> {
    return await db.select().from(elementPerformanceMetrics).orderBy(elementPerformanceMetrics.metricName);
  }

  async getElementPerformanceMetricsByElement(elementId: string): Promise<ElementPerformanceMetric[]> {
    return await db
      .select()
      .from(elementPerformanceMetrics)
      .where(eq(elementPerformanceMetrics.elementId, elementId))
      .orderBy(elementPerformanceMetrics.metricName);
  }

  async createElementPerformanceMetric(metric: InsertElementPerformanceMetric): Promise<ElementPerformanceMetric> {
    const [newMetric] = await db
      .insert(elementPerformanceMetrics)
      .values({
        ...metric,
        percentage: Math.round((metric.currentValue / metric.targetValue) * 100)
      })
      .returning();
    return newMetric;
  }

  async updateElementPerformanceMetric(id: string, metric: Partial<InsertElementPerformanceMetric>): Promise<ElementPerformanceMetric> {
    let updateData = { ...metric, updatedAt: new Date() };
    
    // Recalculate percentage if values changed
    if (metric.currentValue !== undefined || metric.targetValue !== undefined) {
      const existing = await db.select().from(elementPerformanceMetrics).where(eq(elementPerformanceMetrics.id, id)).limit(1);
      if (existing.length > 0) {
        const current = metric.currentValue ?? existing[0].currentValue;
        const target = metric.targetValue ?? existing[0].targetValue;
        updateData.percentage = Math.round((current / target) * 100);
      }
    }
    
    const [updatedMetric] = await db
      .update(elementPerformanceMetrics)
      .set(updateData)
      .where(eq(elementPerformanceMetrics.id, id))
      .returning();
    return updatedMetric;
  }

  async deleteElementPerformanceMetric(id: string): Promise<void> {
    await db.delete(elementPerformanceMetrics).where(eq(elementPerformanceMetrics.id, id));
  }

  // Get performance measures for scorecard grouped by category and element
  async getPerformanceMeasuresForScorecard() {
    const result = await db
      .select({
        id: performanceMeasures.id,
        measureName: performanceMeasures.measureName,
        formula: performanceMeasures.formula,
        source: performanceMeasures.source,
        frequency: performanceMeasures.frequency,
        target: performanceMeasures.target,
        scorecardCategory: performanceMeasures.scorecardCategory,
        processId: performanceMeasures.processId,
        elementId: oeProcesses.elementId,
        elementNumber: oeElements.elementNumber,
        elementTitle: oeElements.title,
        processName: oeProcesses.name,
        processNumber: oeProcesses.processNumber,
      })
      .from(performanceMeasures)
      .innerJoin(oeProcesses, eq(performanceMeasures.processId, oeProcesses.id))
      .innerJoin(oeElements, eq(oeProcesses.elementId, oeElements.id))
      .where(isNotNull(performanceMeasures.scorecardCategory))
      .orderBy(oeElements.elementNumber, performanceMeasures.scorecardCategory, performanceMeasures.measureName);
    
    return result;
  }

  // Document Version operations
  async getDocumentVersions(processId: string): Promise<DocumentVersion[]> {
    return await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.processId, processId))
      .orderBy(desc(documentVersions.createdAt));
  }

  async createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion> {
    const [newVersion] = await db
      .insert(documentVersions)
      .values(version)
      .returning();
    return newVersion;
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    totalProcesses: number;
    activeElements: number;
    pendingReviews: number;
    completionRate: number;
  }> {
    const [totalProcessesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(oeProcesses);

    const [activeElementsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(oeElements)
      .where(eq(oeElements.isActive, true));

    const [pendingReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(oeProcesses)
      .where(eq(oeProcesses.status, 'review'));

    const [activeProcessesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(oeProcesses)
      .where(eq(oeProcesses.status, 'active'));

    const totalProcesses = totalProcessesResult?.count || 0;
    const activeProcesses = activeProcessesResult?.count || 0;
    const completionRate = totalProcesses > 0 ? Math.round((activeProcesses / totalProcesses) * 100) : 0;

    return {
      totalProcesses: totalProcesses,
      activeElements: activeElementsResult?.count || 0,
      pendingReviews: pendingReviewsResult?.count || 0,
      completionRate,
    };
  }

  // Activity tracking operations
  async getRecentActivity(limit: number = 10): Promise<(ActivityLog & { user?: User })[]> {
    const activities = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        action: activityLog.action,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        entityName: activityLog.entityName,
        description: activityLog.description,
        metadata: activityLog.metadata,
        createdAt: activityLog.createdAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.userId, users.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    return activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      entityName: activity.entityName,
      description: activity.description,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      user: activity.userId ? {
        id: activity.userId,
        firstName: activity.userFirstName,
        lastName: activity.userLastName,
        email: activity.userEmail,
      } as User : undefined,
    }));
  }

  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db
      .insert(activityLog)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Goals-to-Processes mind map operations
  async getGoalsToProcessesMindMap(): Promise<any[]> {
    // Query to get strategic goals with their linked processes via performance measures only
    const goalsWithProcesses = await db
      .select({
        goalId: strategicGoals.id,
        goalTitle: strategicGoals.title,
        goalDescription: strategicGoals.description,
        goalCategory: strategicGoals.category,
        goalPriority: strategicGoals.priority,
        goalTargetValue: strategicGoals.targetValue,
        goalCurrentValue: strategicGoals.currentValue,
        goalUnit: strategicGoals.unit,
        processId: oeProcesses.id,
        processName: oeProcesses.name,
        processNumber: oeProcesses.processNumber,
        processDescription: oeProcesses.description,
        processStatus: oeProcesses.status,
        measureId: performanceMeasures.id,
        measureName: performanceMeasures.measureName,
        measureFormula: performanceMeasures.formula,
        measureTarget: performanceMeasures.target,
        measureFrequency: performanceMeasures.frequency,
        measureSource: performanceMeasures.source,
        measureScorecardCategory: performanceMeasures.scorecardCategory,
        elementId: oeElements.id,
        elementTitle: oeElements.title,
        elementNumber: oeElements.elementNumber
      })
      .from(strategicGoals)
      .leftJoin(performanceMeasures, eq(strategicGoals.id, performanceMeasures.strategicGoalId))
      .leftJoin(oeProcesses, eq(performanceMeasures.processId, oeProcesses.id))
      .leftJoin(oeElements, eq(strategicGoals.elementId, oeElements.id))
      .orderBy(strategicGoals.category, strategicGoals.priority, oeProcesses.processNumber);

    // Group the results by strategic goal
    const goalsMap = new Map();
    
    for (const row of goalsWithProcesses) {
      if (!goalsMap.has(row.goalId)) {
        goalsMap.set(row.goalId, {
          id: row.goalId,
          title: row.goalTitle,
          description: row.goalDescription,
          category: row.goalCategory, // This is the scorecard flag
          priority: row.goalPriority,
          targetValue: row.goalTargetValue,
          currentValue: row.goalCurrentValue,
          unit: row.goalUnit,
          element: row.elementId ? {
            id: row.elementId,
            title: row.elementTitle,
            elementNumber: row.elementNumber
          } : null,
          processes: []
        });
      }
      
      const goal = goalsMap.get(row.goalId);
      
      // Add process if it exists and isn't already added
      if (row.processId && !goal.processes.find((p: any) => p.id === row.processId)) {
        goal.processes.push({
          id: row.processId,
          name: row.processName,
          processNumber: row.processNumber,
          description: row.processDescription,
          status: row.processStatus,
          measures: []
        });
      }
      
      // Add measure to the process if it exists
      if (row.measureId && row.processId) {
        const process = goal.processes.find((p: any) => p.id === row.processId);
        if (process && !process.measures.find((m: any) => m.id === row.measureId)) {
          process.measures.push({
            id: row.measureId,
            name: row.measureName,
            formula: row.measureFormula,
            target: row.measureTarget,
            frequency: row.measureFrequency,
            source: row.measureSource,
            scorecardCategory: row.measureScorecardCategory
          });
        }
      }
    }
    
    return Array.from(goalsMap.values());
  }
}

export const storage = new DatabaseStorage();
