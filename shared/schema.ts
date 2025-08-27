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
  issueDate: timestamp("issue_date"),
  revision: integer("revision").default(1),
  status: varchar("status", { length: 50 }).default("draft"), // draft, active, review, archived
  isMandatory: boolean("is_mandatory").default(false),
  // TABLE OF CONTENTS sections
  expectations: text("expectations"),
  responsibilities: text("responsibilities"),
  processStepsContent: text("process_steps_content"),
  performanceMeasureContent: text("performance_measure_content"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Process Steps table
export const processSteps = pgTable("process_steps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  processId: uuid("process_id").references(() => oeProcesses.id, { onDelete: 'cascade' }),
  stepNumber: integer("step_number").notNull(),
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
  measureName: varchar("measure_name", { length: 255 }).notNull(),
  formula: text("formula"),
  source: varchar("source", { length: 255 }),
  frequency: varchar("frequency", { length: 100 }),
  target: varchar("target", { length: 100 }),
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

// Relations
export const oeElementsRelations = relations(oeElements, ({ many }) => ({
  processes: many(oeProcesses),
}));

export const oeProcessesRelations = relations(oeProcesses, ({ one, many }) => ({
  element: one(oeElements, {
    fields: [oeProcesses.elementId],
    references: [oeElements.id],
  }),
  steps: many(processSteps),
  performanceMeasures: many(performanceMeasures),
  versions: many(documentVersions),
  createdByUser: one(users, {
    fields: [oeProcesses.createdBy],
    references: [users.id],
  }),
}));

export const processStepsRelations = relations(processSteps, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [processSteps.processId],
    references: [oeProcesses.id],
  }),
}));

export const performanceMeasuresRelations = relations(performanceMeasures, ({ one }) => ({
  process: one(oeProcesses, {
    fields: [performanceMeasures.processId],
    references: [oeProcesses.id],
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

export const insertPerformanceMeasureSchema = createInsertSchema(performanceMeasures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  createdAt: true,
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
export type PerformanceMeasure = typeof performanceMeasures.$inferSelect;
export type InsertPerformanceMeasure = z.infer<typeof insertPerformanceMeasureSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

// Extended types for API responses
export type OeProcessWithDetails = OeProcess & {
  element?: OeElement | null;
  steps?: ProcessStep[];
  performanceMeasures?: PerformanceMeasure[];
  versions?: DocumentVersion[];
  createdByUser?: User | null;
};

export type OeElementWithProcesses = OeElement & {
  processes?: OeProcess[];
};
