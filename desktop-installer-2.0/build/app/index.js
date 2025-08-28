var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLog: () => activityLog,
  activityLogRelations: () => activityLogRelations,
  documentVersions: () => documentVersions,
  documentVersionsRelations: () => documentVersionsRelations,
  elementPerformanceMetrics: () => elementPerformanceMetrics,
  elementPerformanceMetricsRelations: () => elementPerformanceMetricsRelations,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertDocumentVersionSchema: () => insertDocumentVersionSchema,
  insertElementPerformanceMetricSchema: () => insertElementPerformanceMetricSchema,
  insertOeElementSchema: () => insertOeElementSchema,
  insertOeProcessSchema: () => insertOeProcessSchema,
  insertPerformanceMeasureSchema: () => insertPerformanceMeasureSchema,
  insertProcessStepSchema: () => insertProcessStepSchema,
  insertStrategicGoalSchema: () => insertStrategicGoalSchema,
  oeElements: () => oeElements,
  oeElementsRelations: () => oeElementsRelations,
  oeProcesses: () => oeProcesses,
  oeProcessesRelations: () => oeProcessesRelations,
  performanceMeasures: () => performanceMeasures,
  performanceMeasuresRelations: () => performanceMeasuresRelations,
  processSteps: () => processSteps,
  processStepsRelations: () => processStepsRelations,
  sessions: () => sessions,
  strategicGoals: () => strategicGoals,
  strategicGoalsRelations: () => strategicGoalsRelations,
  users: () => users
});
import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var oeElements = pgTable("oe_elements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementNumber: integer("element_number").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var oeProcesses = pgTable("oe_processes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id),
  processNumber: varchar("process_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  processOwner: varchar("process_owner", { length: 255 }),
  issueDate: timestamp("issue_date"),
  revision: integer("revision").default(1),
  status: varchar("status", { length: 50 }).default("draft"),
  // draft, active, review, archived
  isMandatory: boolean("is_mandatory").default(false),
  // TABLE OF CONTENTS sections
  expectations: text("expectations"),
  responsibilities: text("responsibilities"),
  processStepsContent: text("process_steps_content"),
  performanceMeasureContent: text("performance_measure_content"),
  // Risk Management fields
  riskFrequency: varchar("risk_frequency", { length: 20 }),
  // Low, Medium, High
  riskImpact: varchar("risk_impact", { length: 20 }),
  // Low, Medium, High
  riskDescription: text("risk_description"),
  riskMitigation: text("risk_mitigation"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var processSteps = pgTable("process_steps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(),
  stepDetails: text("step_details"),
  responsibilities: text("responsibilities"),
  references: text("references"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var performanceMeasures = pgTable("performance_measures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: "cascade" }),
  strategicGoalId: uuid("strategic_goal_id").references(() => strategicGoals.id, { onDelete: "set null" }),
  measureName: varchar("measure_name", { length: 255 }).notNull(),
  formula: text("formula"),
  source: varchar("source", { length: 255 }),
  frequency: varchar("frequency", { length: 100 }),
  target: varchar("target", { length: 100 }),
  scorecardCategory: varchar("scorecard_category", { length: 50 }),
  // Financial, Customer, Internal Process, Learning & Growth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  changeLog: text("change_log"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var strategicGoals = pgTable("strategic_goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  unit: varchar("unit", { length: 50 }),
  category: varchar("category", { length: 50 }).notNull(),
  // Financial, Customer, Internal Process, Learning & Growth
  priority: varchar("priority", { length: 20 }).default("Medium"),
  // High, Medium, Low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var elementPerformanceMetrics = pgTable("element_performance_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id, { onDelete: "cascade" }),
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  currentValue: integer("current_value").notNull(),
  targetValue: integer("target_value").notNull(),
  unit: varchar("unit", { length: 50 }),
  trend: varchar("trend", { length: 20 }).default("stable"),
  // up, down, stable
  percentage: integer("percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  // created, updated, deleted, viewed
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  // process, element, strategic_goal
  entityId: uuid("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  description: text("description"),
  metadata: text("metadata"),
  // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow()
});
var oeElementsRelations = relations(oeElements, ({ many }) => ({
  processes: many(oeProcesses),
  strategicGoals: many(strategicGoals),
  performanceMetrics: many(elementPerformanceMetrics)
}));
var oeProcessesRelations = relations(oeProcesses, ({ one, many }) => ({
  element: one(oeElements, {
    fields: [oeProcesses.elementId],
    references: [oeElements.id]
  }),
  steps: many(processSteps),
  performanceMeasures: many(performanceMeasures),
  versions: many(documentVersions),
  createdByUser: one(users, {
    fields: [oeProcesses.createdBy],
    references: [users.id]
  })
}));
var processStepsRelations = relations(processSteps, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [processSteps.processId],
    references: [oeProcesses.id]
  })
}));
var performanceMeasuresRelations = relations(performanceMeasures, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [performanceMeasures.processId],
    references: [oeProcesses.id]
  }),
  strategicGoal: one(strategicGoals, {
    fields: [performanceMeasures.strategicGoalId],
    references: [strategicGoals.id]
  })
}));
var documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [documentVersions.processId],
    references: [oeProcesses.id]
  }),
  createdByUser: one(users, {
    fields: [documentVersions.createdBy],
    references: [users.id]
  }),
  approvedByUser: one(users, {
    fields: [documentVersions.approvedBy],
    references: [users.id]
  })
}));
var strategicGoalsRelations = relations(strategicGoals, ({ one, many }) => ({
  element: one(oeElements, {
    fields: [strategicGoals.elementId],
    references: [oeElements.id]
  }),
  performanceMeasures: many(performanceMeasures)
}));
var elementPerformanceMetricsRelations = relations(elementPerformanceMetrics, ({ one }) => ({
  element: one(oeElements, {
    fields: [elementPerformanceMetrics.elementId],
    references: [oeElements.id]
  })
}));
var activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id]
  })
}));
var insertOeElementSchema = createInsertSchema(oeElements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOeProcessSchema = createInsertSchema(oeProcesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProcessStepSchema = createInsertSchema(processSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPerformanceMeasureSchema = createInsertSchema(performanceMeasures).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  createdAt: true
});
var insertStrategicGoalSchema = createInsertSchema(strategicGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertElementPerformanceMetricSchema = createInsertSchema(elementPerformanceMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, ilike, or, sql as sql2, isNotNull } from "drizzle-orm";
function naturalSort(a, b) {
  const splitIntoTokens = (str) => {
    return str.match(/(\d+|\D+)/g) || [];
  };
  const tokensA = splitIntoTokens(a);
  const tokensB = splitIntoTokens(b);
  const maxLength = Math.max(tokensA.length, tokensB.length);
  for (let i = 0; i < maxLength; i++) {
    const tokenA = tokensA[i] || "";
    const tokenB = tokensB[i] || "";
    const numA = parseFloat(tokenA);
    const numB = parseFloat(tokenB);
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      const comparison = tokenA.localeCompare(tokenB);
      if (comparison !== 0) {
        return comparison;
      }
    }
  }
  return 0;
}
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // OE Element operations
  async getAllOeElements() {
    const elements = await db.query.oeElements.findMany({
      with: {
        processes: true
        // Remove orderBy from query
      },
      orderBy: [oeElements.elementNumber]
    });
    elements.forEach((element) => {
      if (element.processes) {
        element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
      }
    });
    return elements;
  }
  async getOeElementsForMindMap() {
    const elements = await db.query.oeElements.findMany({
      with: {
        processes: {
          with: {
            steps: {
              orderBy: [processSteps.stepNumber]
            }
          }
        }
      },
      orderBy: [oeElements.elementNumber]
    });
    elements.forEach((element) => {
      if (element.processes) {
        element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
      }
    });
    return elements;
  }
  async getOeElement(id) {
    const element = await db.query.oeElements.findFirst({
      where: eq(oeElements.id, id),
      with: {
        processes: {
          with: {
            steps: {
              orderBy: [processSteps.stepNumber]
            },
            performanceMeasures: {
              orderBy: [performanceMeasures.measureName]
            }
          }
        }
      }
    });
    if (element?.processes) {
      element.processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
    }
    return element;
  }
  async createOeElement(element) {
    const [newElement] = await db.insert(oeElements).values(element).returning();
    return newElement;
  }
  async updateOeElement(id, element) {
    const [updatedElement] = await db.update(oeElements).set({ ...element, updatedAt: /* @__PURE__ */ new Date() }).where(eq(oeElements.id, id)).returning();
    return updatedElement;
  }
  async deleteOeElement(id) {
    await db.delete(oeElements).where(eq(oeElements.id, id));
  }
  // OE Process operations
  async getAllOeProcesses(filters) {
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
      where: conditions.length > 0 ? and(...conditions) : void 0,
      with: {
        element: true,
        steps: {
          orderBy: [processSteps.stepNumber]
        },
        performanceMeasures: true,
        versions: {
          orderBy: [desc(documentVersions.createdAt)],
          limit: 5
        },
        createdByUser: true
      }
    });
    processes.sort((a, b) => naturalSort(a.processNumber, b.processNumber));
    return processes;
  }
  async getOeProcess(id) {
    return await db.query.oeProcesses.findFirst({
      where: eq(oeProcesses.id, id),
      with: {
        element: true,
        steps: {
          orderBy: [processSteps.stepNumber]
        },
        performanceMeasures: true,
        versions: {
          orderBy: [desc(documentVersions.createdAt)]
        },
        createdByUser: true
      }
    });
  }
  async createOeProcess(process2) {
    const [newProcess] = await db.insert(oeProcesses).values(process2).returning();
    return newProcess;
  }
  async updateOeProcess(id, process2) {
    const [updatedProcess] = await db.update(oeProcesses).set({ ...process2, updatedAt: /* @__PURE__ */ new Date() }).where(eq(oeProcesses.id, id)).returning();
    return updatedProcess;
  }
  async deleteOeProcess(id) {
    await db.delete(oeProcesses).where(eq(oeProcesses.id, id));
  }
  // Process Step operations
  async getProcessSteps(processId) {
    return await db.select().from(processSteps).where(eq(processSteps.processId, processId)).orderBy(processSteps.stepNumber);
  }
  async createProcessStep(step) {
    const [newStep] = await db.insert(processSteps).values(step).returning();
    return newStep;
  }
  async updateProcessStep(id, step) {
    const [updatedStep] = await db.update(processSteps).set({ ...step, updatedAt: /* @__PURE__ */ new Date() }).where(eq(processSteps.id, id)).returning();
    return updatedStep;
  }
  async deleteProcessStep(id) {
    await db.delete(processSteps).where(eq(processSteps.id, id));
  }
  // Performance Measure operations
  async getPerformanceMeasures(processId) {
    return await db.select().from(performanceMeasures).where(eq(performanceMeasures.processId, processId));
  }
  async createPerformanceMeasure(measure) {
    const [newMeasure] = await db.insert(performanceMeasures).values(measure).returning();
    return newMeasure;
  }
  async updatePerformanceMeasure(id, measure) {
    const [updatedMeasure] = await db.update(performanceMeasures).set({ ...measure, updatedAt: /* @__PURE__ */ new Date() }).where(eq(performanceMeasures.id, id)).returning();
    return updatedMeasure;
  }
  async deletePerformanceMeasure(id) {
    await db.delete(performanceMeasures).where(eq(performanceMeasures.id, id));
  }
  // Strategic Goals operations
  async getAllStrategicGoals() {
    return await db.select().from(strategicGoals).orderBy(strategicGoals.category, strategicGoals.priority);
  }
  async getStrategicGoalsByElement(elementId) {
    return await db.select().from(strategicGoals).where(eq(strategicGoals.elementId, elementId)).orderBy(strategicGoals.category, strategicGoals.priority);
  }
  async createStrategicGoal(goal) {
    const [newGoal] = await db.insert(strategicGoals).values(goal).returning();
    return newGoal;
  }
  async updateStrategicGoal(id, goal) {
    const [updatedGoal] = await db.update(strategicGoals).set({ ...goal, updatedAt: /* @__PURE__ */ new Date() }).where(eq(strategicGoals.id, id)).returning();
    return updatedGoal;
  }
  async deleteStrategicGoal(id) {
    await db.delete(strategicGoals).where(eq(strategicGoals.id, id));
  }
  // Element Performance Metrics operations
  async getAllElementPerformanceMetrics() {
    return await db.select().from(elementPerformanceMetrics).orderBy(elementPerformanceMetrics.metricName);
  }
  async getElementPerformanceMetricsByElement(elementId) {
    return await db.select().from(elementPerformanceMetrics).where(eq(elementPerformanceMetrics.elementId, elementId)).orderBy(elementPerformanceMetrics.metricName);
  }
  async createElementPerformanceMetric(metric) {
    const [newMetric] = await db.insert(elementPerformanceMetrics).values({
      ...metric,
      percentage: Math.round(metric.currentValue / metric.targetValue * 100)
    }).returning();
    return newMetric;
  }
  async updateElementPerformanceMetric(id, metric) {
    let updateData = { ...metric, updatedAt: /* @__PURE__ */ new Date() };
    if (metric.currentValue !== void 0 || metric.targetValue !== void 0) {
      const existing = await db.select().from(elementPerformanceMetrics).where(eq(elementPerformanceMetrics.id, id)).limit(1);
      if (existing.length > 0) {
        const current = metric.currentValue ?? existing[0].currentValue;
        const target = metric.targetValue ?? existing[0].targetValue;
        updateData.percentage = Math.round(current / target * 100);
      }
    }
    const [updatedMetric] = await db.update(elementPerformanceMetrics).set(updateData).where(eq(elementPerformanceMetrics.id, id)).returning();
    return updatedMetric;
  }
  async deleteElementPerformanceMetric(id) {
    await db.delete(elementPerformanceMetrics).where(eq(elementPerformanceMetrics.id, id));
  }
  // Get performance measures for scorecard grouped by category and element
  async getPerformanceMeasuresForScorecard() {
    const result = await db.select({
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
      processNumber: oeProcesses.processNumber
    }).from(performanceMeasures).innerJoin(oeProcesses, eq(performanceMeasures.processId, oeProcesses.id)).innerJoin(oeElements, eq(oeProcesses.elementId, oeElements.id)).where(isNotNull(performanceMeasures.scorecardCategory)).orderBy(oeElements.elementNumber, performanceMeasures.scorecardCategory, performanceMeasures.measureName);
    return result;
  }
  // Document Version operations
  async getDocumentVersions(processId) {
    return await db.select().from(documentVersions).where(eq(documentVersions.processId, processId)).orderBy(desc(documentVersions.createdAt));
  }
  async createDocumentVersion(version) {
    const [newVersion] = await db.insert(documentVersions).values(version).returning();
    return newVersion;
  }
  // Dashboard analytics
  async getDashboardStats() {
    const [totalProcessesResult] = await db.select({ count: sql2`count(*)` }).from(oeProcesses);
    const [activeElementsResult] = await db.select({ count: sql2`count(*)` }).from(oeElements).where(eq(oeElements.isActive, true));
    const [pendingReviewsResult] = await db.select({ count: sql2`count(*)` }).from(oeProcesses).where(eq(oeProcesses.status, "review"));
    const [activeProcessesResult] = await db.select({ count: sql2`count(*)` }).from(oeProcesses).where(eq(oeProcesses.status, "active"));
    const totalProcesses = totalProcessesResult?.count || 0;
    const activeProcesses = activeProcessesResult?.count || 0;
    const completionRate = totalProcesses > 0 ? Math.round(activeProcesses / totalProcesses * 100) : 0;
    return {
      totalProcesses,
      activeElements: activeElementsResult?.count || 0,
      pendingReviews: pendingReviewsResult?.count || 0,
      completionRate
    };
  }
  // Activity tracking operations
  async getRecentActivity(limit = 10) {
    const activities = await db.select({
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
      userEmail: users.email
    }).from(activityLog).leftJoin(users, eq(activityLog.userId, users.id)).orderBy(desc(activityLog.createdAt)).limit(limit);
    return activities.map((activity) => ({
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
        email: activity.userEmail
      } : void 0
    }));
  }
  async logActivity(activity) {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }
  // Goals-to-Processes mind map operations
  async getGoalsToProcessesMindMap() {
    const goalsWithProcesses = await db.select({
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
    }).from(strategicGoals).leftJoin(performanceMeasures, eq(strategicGoals.id, performanceMeasures.strategicGoalId)).leftJoin(oeProcesses, eq(performanceMeasures.processId, oeProcesses.id)).leftJoin(oeElements, eq(strategicGoals.elementId, oeElements.id)).orderBy(strategicGoals.category, strategicGoals.priority, oeProcesses.processNumber);
    const goalsMap = /* @__PURE__ */ new Map();
    for (const row of goalsWithProcesses) {
      if (!goalsMap.has(row.goalId)) {
        goalsMap.set(row.goalId, {
          id: row.goalId,
          title: row.goalTitle,
          description: row.goalDescription,
          category: row.goalCategory,
          // This is the scorecard flag
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
      if (row.processId && !goal.processes.find((p) => p.id === row.processId)) {
        goal.processes.push({
          id: row.processId,
          name: row.processName,
          processNumber: row.processNumber,
          description: row.processDescription,
          status: row.processStatus,
          measures: []
        });
      }
      if (row.measureId && row.processId) {
        const process2 = goal.processes.find((p) => p.id === row.processId);
        if (process2 && !process2.measures.find((m) => m.id === row.measureId)) {
          process2.measures.push({
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
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      // Allow HTTP for development/preview
      maxAge: sessionTtl,
      sameSite: "lax"
      // Allow cross-site requests for preview
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' *.replit.dev *.replit.com");
    next();
  });
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/activity-log", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });
  app2.get("/api/oe-elements", isAuthenticated, async (req, res) => {
    try {
      const elements = await storage.getAllOeElements();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements:", error);
      res.status(500).json({ message: "Failed to fetch OE elements" });
    }
  });
  app2.get("/api/mindmap/elements", isAuthenticated, async (req, res) => {
    try {
      const elements = await storage.getOeElementsForMindMap();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements for mind map:", error);
      res.status(500).json({ message: "Failed to fetch OE elements for mind map" });
    }
  });
  app2.get("/api/mindmap/goals-processes", isAuthenticated, async (req, res) => {
    try {
      const goalsWithProcesses = await storage.getGoalsToProcessesMindMap();
      res.json(goalsWithProcesses);
    } catch (error) {
      console.error("Error fetching Goals-to-Processes mind map:", error);
      res.status(500).json({ message: "Failed to fetch Goals-to-Processes mind map" });
    }
  });
  app2.get("/api/oe-elements/:id", isAuthenticated, async (req, res) => {
    try {
      const element = await storage.getOeElement(req.params.id);
      if (!element) {
        return res.status(404).json({ message: "OE element not found" });
      }
      res.json(element);
    } catch (error) {
      console.error("Error fetching OE element:", error);
      res.status(500).json({ message: "Failed to fetch OE element" });
    }
  });
  app2.post("/api/oe-elements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertOeElementSchema.parse(req.body);
      const element = await storage.createOeElement(validatedData);
      await storage.logActivity({
        userId,
        action: "created",
        entityType: "element",
        entityId: element.id,
        entityName: element.title,
        description: `Created OE element "${element.title}"`
      });
      res.status(201).json(element);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating OE element:", error);
      res.status(500).json({ message: "Failed to create OE element" });
    }
  });
  app2.put("/api/oe-elements/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOeElementSchema.partial().parse(req.body);
      const element = await storage.updateOeElement(req.params.id, validatedData);
      res.json(element);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE element:", error);
      res.status(500).json({ message: "Failed to update OE element" });
    }
  });
  app2.delete("/api/oe-elements/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const element = await storage.getOeElement(req.params.id);
      await storage.deleteOeElement(req.params.id);
      if (element) {
        await storage.logActivity({
          userId,
          action: "deleted",
          entityType: "element",
          entityId: element.id,
          entityName: element.title,
          description: `Deleted OE element "${element.title}"`
        });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE element:", error);
      res.status(500).json({ message: "Failed to delete OE element" });
    }
  });
  app2.get("/api/oe-processes", isAuthenticated, async (req, res) => {
    try {
      const filters = {
        elementId: req.query.elementId,
        status: req.query.status,
        search: req.query.search
      };
      const processes = await storage.getAllOeProcesses(filters);
      res.json(processes);
    } catch (error) {
      console.error("Error fetching OE processes:", error);
      res.status(500).json({ message: "Failed to fetch OE processes" });
    }
  });
  app2.get("/api/oe-processes/:id", isAuthenticated, async (req, res) => {
    try {
      const process2 = await storage.getOeProcess(req.params.id);
      if (!process2) {
        return res.status(404).json({ message: "OE process not found" });
      }
      res.json(process2);
    } catch (error) {
      console.error("Error fetching OE process:", error);
      res.status(500).json({ message: "Failed to fetch OE process" });
    }
  });
  app2.post("/api/oe-processes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      if (req.body.issueDate && typeof req.body.issueDate === "string") {
        req.body.issueDate = new Date(req.body.issueDate);
      }
      const validatedData = insertOeProcessSchema.parse({
        ...req.body,
        createdBy: userId
      });
      const process2 = await storage.createOeProcess(validatedData);
      await storage.logActivity({
        userId,
        action: "created",
        entityType: "process",
        entityId: process2.id,
        entityName: process2.name,
        description: `Created process "${process2.name}"`
      });
      res.status(201).json(process2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating OE process:", error);
      res.status(500).json({ message: "Failed to create OE process" });
    }
  });
  app2.put("/api/oe-processes/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.body.issueDate && typeof req.body.issueDate === "string") {
        req.body.issueDate = new Date(req.body.issueDate);
      }
      const validatedData = insertOeProcessSchema.partial().parse(req.body);
      const process2 = await storage.updateOeProcess(req.params.id, validatedData);
      res.json(process2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE process:", error);
      res.status(500).json({ message: "Failed to update OE process" });
    }
  });
  app2.patch("/api/oe-processes/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.body.issueDate && typeof req.body.issueDate === "string") {
        req.body.issueDate = new Date(req.body.issueDate);
      }
      const validatedData = insertOeProcessSchema.partial().parse(req.body);
      const process2 = await storage.updateOeProcess(req.params.id, validatedData);
      res.json(process2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE process:", error);
      res.status(500).json({ message: "Failed to update OE process" });
    }
  });
  app2.delete("/api/oe-processes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const process2 = await storage.getOeProcess(req.params.id);
      await storage.deleteOeProcess(req.params.id);
      if (process2) {
        await storage.logActivity({
          userId,
          action: "deleted",
          entityType: "process",
          entityId: process2.id,
          entityName: process2.name,
          description: `Deleted process "${process2.name}"`
        });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE process:", error);
      res.status(500).json({ message: "Failed to delete OE process" });
    }
  });
  app2.get("/api/oe-processes/:processId/steps", isAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getProcessSteps(req.params.processId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching process steps:", error);
      res.status(500).json({ message: "Failed to fetch process steps" });
    }
  });
  app2.post("/api/oe-processes/:processId/steps", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProcessStepSchema.parse({
        ...req.body,
        processId: req.params.processId
      });
      const step = await storage.createProcessStep(validatedData);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating process step:", error);
      res.status(500).json({ message: "Failed to create process step" });
    }
  });
  app2.put("/api/process-steps/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProcessStepSchema.partial().parse(req.body);
      const step = await storage.updateProcessStep(req.params.id, validatedData);
      res.json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating process step:", error);
      res.status(500).json({ message: "Failed to update process step" });
    }
  });
  app2.delete("/api/process-steps/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProcessStep(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting process step:", error);
      res.status(500).json({ message: "Failed to delete process step" });
    }
  });
  app2.get("/api/oe-processes/:processId/measures", isAuthenticated, async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasures(req.params.processId);
      res.json(measures);
    } catch (error) {
      console.error("Error fetching performance measures:", error);
      res.status(500).json({ message: "Failed to fetch performance measures" });
    }
  });
  app2.post("/api/oe-processes/:processId/measures", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPerformanceMeasureSchema.parse({
        ...req.body,
        processId: req.params.processId
      });
      const measure = await storage.createPerformanceMeasure(validatedData);
      await storage.logActivity({
        userId,
        action: "created",
        entityType: "performance_measure",
        entityId: measure.id,
        entityName: measure.measureName,
        description: `Created performance measure "${measure.measureName}"`
      });
      res.status(201).json(measure);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating performance measure:", error);
      res.status(500).json({ message: "Failed to create performance measure" });
    }
  });
  app2.put("/api/performance-measures/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPerformanceMeasureSchema.partial().parse(req.body);
      const measure = await storage.updatePerformanceMeasure(req.params.id, validatedData);
      res.json(measure);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating performance measure:", error);
      res.status(500).json({ message: "Failed to update performance measure" });
    }
  });
  app2.delete("/api/performance-measures/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePerformanceMeasure(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting performance measure:", error);
      res.status(500).json({ message: "Failed to delete performance measure" });
    }
  });
  app2.get("/api/oe-processes/:processId/versions", isAuthenticated, async (req, res) => {
    try {
      const versions = await storage.getDocumentVersions(req.params.processId);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching document versions:", error);
      res.status(500).json({ message: "Failed to fetch document versions" });
    }
  });
  app2.post("/api/oe-processes/:processId/versions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDocumentVersionSchema.parse({
        ...req.body,
        processId: req.params.processId,
        createdBy: userId
      });
      const version = await storage.createDocumentVersion(validatedData);
      res.status(201).json(version);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating document version:", error);
      res.status(500).json({ message: "Failed to create document version" });
    }
  });
  app2.get("/api/strategic-goals", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getAllStrategicGoals();
      res.json(goals);
    } catch (error) {
      console.error("Error fetching strategic goals:", error);
      res.status(500).json({ message: "Failed to fetch strategic goals" });
    }
  });
  app2.get("/api/strategic-goals/element/:elementId", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getStrategicGoalsByElement(req.params.elementId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching strategic goals for element:", error);
      res.status(500).json({ message: "Failed to fetch strategic goals" });
    }
  });
  app2.post("/api/strategic-goals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertStrategicGoalSchema.parse(req.body);
      const goal = await storage.createStrategicGoal(goalData);
      await storage.logActivity({
        userId,
        action: "created",
        entityType: "strategic_goal",
        entityId: goal.id,
        entityName: goal.title,
        description: `Created strategic goal "${goal.title}"`
      });
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating strategic goal:", error);
      res.status(500).json({ message: "Failed to create strategic goal" });
    }
  });
  app2.put("/api/strategic-goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalData = insertStrategicGoalSchema.partial().parse(req.body);
      const goal = await storage.updateStrategicGoal(req.params.id, goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating strategic goal:", error);
      res.status(500).json({ message: "Failed to update strategic goal" });
    }
  });
  app2.delete("/api/strategic-goals/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStrategicGoal(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting strategic goal:", error);
      res.status(500).json({ message: "Failed to delete strategic goal" });
    }
  });
  app2.get("/api/performance-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getAllElementPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });
  app2.get("/api/performance-metrics/element/:elementId", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getElementPerformanceMetricsByElement(req.params.elementId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics for element:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });
  app2.post("/api/performance-metrics", isAuthenticated, async (req, res) => {
    try {
      const metricData = insertElementPerformanceMetricSchema.parse(req.body);
      const metric = await storage.createElementPerformanceMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating performance metric:", error);
      res.status(500).json({ message: "Failed to create performance metric" });
    }
  });
  app2.put("/api/performance-metrics/:id", isAuthenticated, async (req, res) => {
    try {
      const metricData = insertElementPerformanceMetricSchema.partial().parse(req.body);
      const metric = await storage.updateElementPerformanceMetric(req.params.id, metricData);
      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating performance metric:", error);
      res.status(500).json({ message: "Failed to update performance metric" });
    }
  });
  app2.delete("/api/performance-metrics/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteElementPerformanceMetric(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting performance metric:", error);
      res.status(500).json({ message: "Failed to delete performance metric" });
    }
  });
  app2.get("/api/scorecard/performance-measures", isAuthenticated, async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasuresForScorecard();
      res.json(measures);
    } catch (error) {
      console.error("Error fetching scorecard performance measures:", error);
      res.status(500).json({ message: "Failed to fetch scorecard performance measures" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
