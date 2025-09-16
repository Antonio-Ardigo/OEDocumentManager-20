import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OE Elements table
export const oeElements = pgTable("oe_elements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementNumber: integer("element_number").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  isActive: boolean("is_active").default(true),
  enablingElements: text("enabling_elements").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OE Processes table
export const oeProcesses = pgTable("oe_processes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id),
  processNumber: varchar("process_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  processOwner: varchar("process_owner", { length: 255 }),
  processType: varchar("process_type", { length: 20 }).default("sequential"), // sequential, decisionTree
  issueDate: timestamp("issue_date"),
  revision: integer("revision").default(1),
  status: varchar("status", { length: 50 }).default("draft"), // draft, active, review, archived
  isMandatory: boolean("is_mandatory").default(false),
  // TABLE OF CONTENTS sections
  expectations: text("expectations"),
  inputToProcess: text("input_to_process"),
  deliverable: text("deliverable"),
  criticalToProcessQuality: text("critical_to_process_quality"),
  responsibilities: text("responsibilities"),
  processStepsContent: text("process_steps_content"),
  performanceMeasureContent: text("performance_measure_content"),
  // Risk Management fields
  riskFrequency: varchar("risk_frequency", { length: 20 }), // Low, Medium, High
  riskImpact: varchar("risk_impact", { length: 20 }), // Low, Medium, High
  riskDescription: text("risk_description"),
  riskMitigation: text("risk_mitigation"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Process Steps table
export const processSteps = pgTable("process_steps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  stepNumber: integer("step_number").notNull(),
  stepType: varchar("step_type", { length: 20 }).default("task"), // task, decision, start, end
  stepName: varchar("step_name", { length: 255 }).notNull(),
  stepDetails: text("step_details"),
  responsibilities: text("responsibilities"),
  references: text("references"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance Measures/KPIs table
export const performanceMeasures = pgTable("performance_measures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  strategicGoalId: uuid("strategic_goal_id").references(() => strategicGoals.id, { onDelete: 'set null' }),
  measureName: varchar("measure_name", { length: 255 }).notNull(),
  formula: text("formula"),
  source: varchar("source", { length: 255 }),
  frequency: varchar("frequency", { length: 100 }),
  target: varchar("target", { length: 100 }),
  scorecardCategory: varchar("scorecard_category", { length: 50 }), // Financial, Customer, Internal Process, Learning & Growth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Versions table for version control
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  versionNumber: integer("version_number").notNull(),
  changeLog: text("change_log"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Process Document Attachments table
export const processDocuments = pgTable("process_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Strategic Goals table for Balanced Scorecard
export const strategicGoals = pgTable("strategic_goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  unit: varchar("unit", { length: 50 }),
  category: varchar("category", { length: 50 }).notNull(), // Financial, Customer, Internal Process, Learning & Growth
  priority: varchar("priority", { length: 20 }).default("Medium"), // High, Medium, Low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Element Performance Metrics table for actual performance values
export const elementPerformanceMetrics = pgTable("element_performance_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  elementId: uuid("element_id").references(() => oeElements.id, { onDelete: 'cascade' }),
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  currentValue: integer("current_value").notNull(),
  targetValue: integer("target_value").notNull(),
  unit: varchar("unit", { length: 50 }),
  trend: varchar("trend", { length: 20 }).default("stable"), // up, down, stable
  percentage: integer("percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Process Step Edges table for decision tree flow
export const processStepEdges = pgTable("process_step_edges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  fromStepId: uuid("from_step_id").references(() => processSteps.id, { onDelete: 'cascade' }),
  toStepId: uuid("to_step_id").references(() => processSteps.id, { onDelete: 'cascade' }),
  label: varchar("label", { length: 255 }), // e.g., "Yes", "No", "Critical", "Non-Critical"
  priority: integer("priority").default(0), // for ordering multiple branches
  guard: jsonb("guard"), // JSON condition for branching logic
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_process_step_edges_process").on(table.processId),
  index("idx_process_step_edges_from_step").on(table.fromStepId),
]);

// Activity Log table for tracking user actions
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // created, updated, deleted, viewed
  entityType: varchar("entity_type", { length: 50 }).notNull(), // process, element, strategic_goal
  entityId: uuid("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  description: text("description"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const oeElementsRelations = relations(oeElements, ({ many }) => ({
  processes: many(oeProcesses),
  strategicGoals: many(strategicGoals),
  performanceMetrics: many(elementPerformanceMetrics),
}));

export const oeProcessesRelations = relations(oeProcesses, ({ one, many }) => ({
  element: one(oeElements, {
    fields: [oeProcesses.elementId],
    references: [oeElements.id],
  }),
  steps: many(processSteps),
  stepEdges: many(processStepEdges),
  performanceMeasures: many(performanceMeasures),
  versions: many(documentVersions),
  documents: many(processDocuments),
  createdByUser: one(users, {
    fields: [oeProcesses.createdBy],
    references: [users.id],
  }),
}));

export const processStepsRelations = relations(processSteps, ({ one, many }) => ({
  process: one(oeProcesses, {
    fields: [processSteps.processId],
    references: [oeProcesses.id],
  }),
  outgoingEdges: many(processStepEdges, {
    relationName: "fromStep",
  }),
  incomingEdges: many(processStepEdges, {
    relationName: "toStep",
  }),
}));

export const processStepEdgesRelations = relations(processStepEdges, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [processStepEdges.processId],
    references: [oeProcesses.id],
  }),
  fromStep: one(processSteps, {
    fields: [processStepEdges.fromStepId],
    references: [processSteps.id],
    relationName: "fromStep",
  }),
  toStep: one(processSteps, {
    fields: [processStepEdges.toStepId],
    references: [processSteps.id],
    relationName: "toStep",
  }),
}));

export const performanceMeasuresRelations = relations(performanceMeasures, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [performanceMeasures.processId],
    references: [oeProcesses.id],
  }),
  strategicGoal: one(strategicGoals, {
    fields: [performanceMeasures.strategicGoalId],
    references: [strategicGoals.id],
  }),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [documentVersions.processId],
    references: [oeProcesses.id],
  }),
  createdByUser: one(users, {
    fields: [documentVersions.createdBy],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [documentVersions.approvedBy],
    references: [users.id],
  }),
}));

export const strategicGoalsRelations = relations(strategicGoals, ({ one, many }) => ({
  element: one(oeElements, {
    fields: [strategicGoals.elementId],
    references: [oeElements.id],
  }),
  performanceMeasures: many(performanceMeasures),
}));

export const elementPerformanceMetricsRelations = relations(elementPerformanceMetrics, ({ one }) => ({
  element: one(oeElements, {
    fields: [elementPerformanceMetrics.elementId],
    references: [oeElements.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const processDocumentsRelations = relations(processDocuments, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [processDocuments.processId],
    references: [oeProcesses.id],
  }),
  uploadedByUser: one(users, {
    fields: [processDocuments.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertOeElementSchema = createInsertSchema(oeElements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOeProcessSchema = createInsertSchema(oeProcesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProcessStepSchema = createInsertSchema(processSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProcessStepEdgeSchema = createInsertSchema(processStepEdges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Guard condition schema for decision tree branching
export const guardConditionSchema = z.object({
  operator: z.enum(["ALL", "ANY"]), // ALL = AND logic, ANY = OR logic
  rules: z.array(z.object({
    fieldPath: z.string(), // e.g., "equipment.status", "inspection.result"
    operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
}).optional();

export const insertPerformanceMeasureSchema = createInsertSchema(performanceMeasures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  createdAt: true,
});

export const insertStrategicGoalSchema = createInsertSchema(strategicGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertElementPerformanceMetricSchema = createInsertSchema(elementPerformanceMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

export const insertProcessDocumentSchema = createInsertSchema(processDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type OeElement = typeof oeElements.$inferSelect;
export type InsertOeElement = z.infer<typeof insertOeElementSchema>;
export type OeProcess = typeof oeProcesses.$inferSelect;
export type InsertOeProcess = z.infer<typeof insertOeProcessSchema>;
export type ProcessStep = typeof processSteps.$inferSelect;
export type InsertProcessStep = z.infer<typeof insertProcessStepSchema>;
export type ProcessStepEdge = typeof processStepEdges.$inferSelect;
export type InsertProcessStepEdge = z.infer<typeof insertProcessStepEdgeSchema>;
export type GuardCondition = z.infer<typeof guardConditionSchema>;
export type PerformanceMeasure = typeof performanceMeasures.$inferSelect;
export type InsertPerformanceMeasure = z.infer<typeof insertPerformanceMeasureSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type StrategicGoal = typeof strategicGoals.$inferSelect;
export type InsertStrategicGoal = z.infer<typeof insertStrategicGoalSchema>;
export type ElementPerformanceMetric = typeof elementPerformanceMetrics.$inferSelect;
export type InsertElementPerformanceMetric = z.infer<typeof insertElementPerformanceMetricSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ProcessDocument = typeof processDocuments.$inferSelect;
export type InsertProcessDocument = z.infer<typeof insertProcessDocumentSchema>;

// Extended types for API responses
export type OeProcessWithDetails = OeProcess & {
  element?: OeElement | null;
  steps?: ProcessStep[];
  stepEdges?: ProcessStepEdge[];
  performanceMeasures?: PerformanceMeasure[];
  versions?: DocumentVersion[];
  documents?: ProcessDocument[];
  createdByUser?: User | null;
};

// Decision tree graph types
export type ProcessGraphNode = ProcessStep;
export type ProcessGraphEdge = ProcessStepEdge;
export type ProcessGraph = {
  nodes: ProcessGraphNode[];
  edges: ProcessGraphEdge[];
};

export type OeElementWithProcesses = OeElement & {
  processes?: OeProcessWithDetails[];
  strategicGoals?: StrategicGoal[];
  performanceMetrics?: ElementPerformanceMetric[];
};
