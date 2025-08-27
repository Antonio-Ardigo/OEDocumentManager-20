import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertOeElementSchema,
  insertOeProcessSchema,
  insertProcessStepSchema,
  insertPerformanceMeasureSchema,
  insertDocumentVersionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // OE Elements routes
  app.get('/api/oe-elements', isAuthenticated, async (req, res) => {
    try {
      const elements = await storage.getAllOeElements();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements:", error);
      res.status(500).json({ message: "Failed to fetch OE elements" });
    }
  });

  // Get all OE elements with processes and steps for mind map
  app.get('/api/oe-elements/mindmap', isAuthenticated, async (req, res) => {
    try {
      const elements = await storage.getOeElementsForMindMap();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements for mind map:", error);
      res.status(500).json({ message: "Failed to fetch OE elements for mind map" });
    }
  });

  app.get('/api/oe-elements/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/oe-elements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOeElementSchema.parse(req.body);
      const element = await storage.createOeElement(validatedData);
      res.status(201).json(element);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating OE element:", error);
      res.status(500).json({ message: "Failed to create OE element" });
    }
  });

  app.put('/api/oe-elements/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/oe-elements/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteOeElement(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE element:", error);
      res.status(500).json({ message: "Failed to delete OE element" });
    }
  });

  // OE Processes routes
  app.get('/api/oe-processes', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        elementId: req.query.elementId as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const processes = await storage.getAllOeProcesses(filters);
      res.json(processes);
    } catch (error) {
      console.error("Error fetching OE processes:", error);
      res.status(500).json({ message: "Failed to fetch OE processes" });
    }
  });

  app.get('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      const process = await storage.getOeProcess(req.params.id);
      if (!process) {
        return res.status(404).json({ message: "OE process not found" });
      }
      res.json(process);
    } catch (error) {
      console.error("Error fetching OE process:", error);
      res.status(500).json({ message: "Failed to fetch OE process" });
    }
  });

  app.post('/api/oe-processes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertOeProcessSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const process = await storage.createOeProcess(validatedData);
      res.status(201).json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating OE process:", error);
      res.status(500).json({ message: "Failed to create OE process" });
    }
  });

  app.put('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOeProcessSchema.partial().parse(req.body);
      const process = await storage.updateOeProcess(req.params.id, validatedData);
      res.json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE process:", error);
      res.status(500).json({ message: "Failed to update OE process" });
    }
  });

  app.patch('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOeProcessSchema.partial().parse(req.body);
      const process = await storage.updateOeProcess(req.params.id, validatedData);
      res.json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE process:", error);
      res.status(500).json({ message: "Failed to update OE process" });
    }
  });

  app.delete('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteOeProcess(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE process:", error);
      res.status(500).json({ message: "Failed to delete OE process" });
    }
  });

  // Process Steps routes
  app.get('/api/oe-processes/:processId/steps', isAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getProcessSteps(req.params.processId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching process steps:", error);
      res.status(500).json({ message: "Failed to fetch process steps" });
    }
  });

  app.post('/api/oe-processes/:processId/steps', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProcessStepSchema.parse({
        ...req.body,
        processId: req.params.processId,
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

  app.put('/api/process-steps/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/process-steps/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProcessStep(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting process step:", error);
      res.status(500).json({ message: "Failed to delete process step" });
    }
  });

  // Performance Measures routes
  app.get('/api/oe-processes/:processId/measures', isAuthenticated, async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasures(req.params.processId);
      res.json(measures);
    } catch (error) {
      console.error("Error fetching performance measures:", error);
      res.status(500).json({ message: "Failed to fetch performance measures" });
    }
  });

  app.post('/api/oe-processes/:processId/measures', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPerformanceMeasureSchema.parse({
        ...req.body,
        processId: req.params.processId,
      });
      const measure = await storage.createPerformanceMeasure(validatedData);
      res.status(201).json(measure);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating performance measure:", error);
      res.status(500).json({ message: "Failed to create performance measure" });
    }
  });

  app.put('/api/performance-measures/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/performance-measures/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePerformanceMeasure(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting performance measure:", error);
      res.status(500).json({ message: "Failed to delete performance measure" });
    }
  });

  // Document Versions routes
  app.get('/api/oe-processes/:processId/versions', isAuthenticated, async (req, res) => {
    try {
      const versions = await storage.getDocumentVersions(req.params.processId);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching document versions:", error);
      res.status(500).json({ message: "Failed to fetch document versions" });
    }
  });

  app.post('/api/oe-processes/:processId/versions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDocumentVersionSchema.parse({
        ...req.body,
        processId: req.params.processId,
        createdBy: userId,
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

  const httpServer = createServer(app);
  return httpServer;
}
