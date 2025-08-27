import {
  users,
  oeElements,
  oeProcesses,
  processSteps,
  performanceMeasures,
  documentVersions,
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
  type OeProcessWithDetails,
  type OeElementWithProcesses,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, sql, asc } from "drizzle-orm";

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
}

// Helper function for natural alphanumeric sorting
function naturalSort(a: string, b: string): number {
  const normalize = (str: string) => {
    // Split string into parts of letters and numbers
    return str.replace(/(\d+)/g, (match) => {
      // Pad numbers with leading zeros for proper sorting
      return match.padStart(10, '0');
    });
  };
  
  return normalize(a).localeCompare(normalize(b));
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
        processes: true, // Remove orderBy from query
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
}

export const storage = new DatabaseStorage();
