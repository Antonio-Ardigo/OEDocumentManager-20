import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import {
  insertOeElementSchema,
  insertOeProcessSchema,
  insertProcessStepSchema,
  insertPerformanceMeasureSchema,
  insertDocumentVersionSchema,
  insertStrategicGoalSchema,
  insertElementPerformanceMetricSchema,
  insertActivityLogSchema,
  processSteps,
  performanceMeasures,
} from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { storage } from "./storage";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add headers for preview/iframe support
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *.replit.dev *.replit.com");
    next();
  });

  // Simplified auth setup
  setupAuth(app);

  // Agent authentication endpoints
  app.get('/api/login', async (req, res) => {
    res.json({ 
      message: 'Login endpoint - use POST with username and password',
      usage: 'POST /api/login with {"username": "agent_user", "password": "agent_access_2024"}' 
    });
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple credentials for agents
    if (username === 'agent_user' && password === 'agent_access_2024') {
      (req.session as any).isAgent = true;
      (req.session as any).agentId = 'agent_user';
      res.json({ 
        success: true, 
        message: 'Authenticated successfully',
        sessionId: req.sessionID
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to logout' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Public API routes (no authentication required) - for ChatGPT and other web agents
  app.get('/public-api/elements', async (req, res) => {
    try {
      const elements = await storage.getAllOeElements();
      res.json(elements.map(element => ({
        id: element.id,
        title: element.title,
        description: element.description,
        elementNumber: element.elementNumber,
      })));
    } catch (error) {
      console.error("Error fetching public elements:", error);
      res.status(500).json({ message: "Failed to fetch elements" });
    }
  });

  app.get('/public-api/elements/:id', async (req, res) => {
    try {
      const element = await storage.getOeElement(req.params.id);
      if (!element) {
        return res.status(404).json({ message: "Element not found" });
      }
      res.json({
        id: element.id,
        title: element.title,
        description: element.description,
        elementNumber: element.elementNumber,
        processes: element.processes || []
      });
    } catch (error) {
      console.error("Error fetching public element:", error);
      res.status(500).json({ message: "Failed to fetch element" });
    }
  });

  app.get('/public-api/processes', async (req, res) => {
    try {
      const processes = await storage.getAllOeProcesses();
      res.json(processes.map(process => ({
        id: process.id,
        name: process.name,
        processNumber: process.processNumber,
        description: process.description,
        status: process.status,
        elementId: process.elementId,
        expectations: process.expectations,
        riskFrequency: process.riskFrequency,
        riskImpact: process.riskImpact,
        riskDescription: process.riskDescription,
        riskMitigation: process.riskMitigation,
      })));
    } catch (error) {
      console.error("Error fetching public processes:", error);
      res.status(500).json({ message: "Failed to fetch processes" });
    }
  });

  app.get('/public-api/processes/:id', async (req, res) => {
    try {
      const process = await storage.getOeProcess(req.params.id);
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json({
        id: process.id,
        name: process.name,
        processNumber: process.processNumber,
        description: process.description,
        status: process.status,
        expectations: process.expectations,
        riskFrequency: process.riskFrequency,
        riskImpact: process.riskImpact,
        riskDescription: process.riskDescription,
        riskMitigation: process.riskMitigation,
        steps: process.steps || [],
        performanceMeasures: process.performanceMeasures || [],
        element: process.element,
      });
    } catch (error) {
      console.error("Error fetching public process:", error);
      res.status(500).json({ message: "Failed to fetch process" });
    }
  });

  app.get('/public-api/site-info', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const elements = await storage.getAllOeElements();
      
      res.json({
        siteName: "WSM Operational Excellence Manager",
        description: "Comprehensive desktop application for managing operational excellence processes with a 4-element OE framework",
        framework: "4-element OE framework (OE-1: Transition Plan, OE-3: Purification Plant Operations, OE-4: Asset Management, OE-5: Strategic Localization)",
        statistics: {
          totalProcesses: stats.totalProcesses,
          activeElements: stats.activeElements,
          totalElements: elements.length,
        },
        elements: elements.map(el => ({
          number: el.elementNumber,
          title: el.title,
          description: el.description,
          processCount: el.processes?.length || 0
        })),
        publicApiEndpoints: [
          '/public-api/elements - List all OE elements',
          '/public-api/elements/{id} - Get specific element with processes',
          '/public-api/processes - List all processes',
          '/public-api/processes/{id} - Get specific process details',
          '/public-api/site-info - This endpoint'
        ]
      });
    } catch (error) {
      console.error("Error fetching site info:", error);
      res.status(500).json({ message: "Failed to fetch site information" });
    }
  });

  // User info route
  app.get('/api/auth/user', async (req: any, res) => {
    // Return mock user info (no authentication required)
    return res.json({
      id: 'agent_user',
      email: 'agent@system.local',
      firstName: 'Agent',
      lastName: 'User',
      profileImageUrl: null
    });
  });

  // Dashboard stats - Now accessible to guests
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Activity log routes
  app.get('/api/activity-log', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  // OE Elements routes - Now accessible to guests
  app.get('/api/oe-elements', async (req, res) => {
    try {
      const elements = await storage.getAllOeElements();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements:", error);
      res.status(500).json({ message: "Failed to fetch OE elements" });
    }
  });

  // Get all OE elements with processes and steps for mind map (must come before :id route)
  app.get('/api/mindmap/elements', async (req, res) => {
    try {
      const elements = await storage.getOeElementsForMindMap();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements for mind map:", error);
      res.status(500).json({ message: "Failed to fetch OE elements for mind map" });
    }
  });

  // Get strategic goals with linked processes for Goals-to-Processes mind map
  app.get('/api/mindmap/goals-processes', async (req, res) => {
    try {
      const goalsWithProcesses = await storage.getGoalsToProcessesMindMap();
      res.json(goalsWithProcesses);
    } catch (error) {
      console.error("Error fetching Goals-to-Processes mind map:", error);
      res.status(500).json({ message: "Failed to fetch Goals-to-Processes mind map" });
    }
  });

  app.get('/api/oe-elements/:id', async (req, res) => {
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

  app.post('/api/oe-elements', async (req: any, res) => {
    try {
      const userId = 'agent_user';
      const validatedData = insertOeElementSchema.parse(req.body);
      const element = await storage.createOeElement(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'created',
        entityType: 'element',
        entityId: element.id,
        entityName: element.title,
        description: `Created OE element "${element.title}"`,
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

  app.put('/api/oe-elements/:id', async (req, res) => {
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

  app.delete('/api/oe-elements/:id', async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get element details before deletion for logging
      const element = await storage.getOeElement(req.params.id);
      
      await storage.deleteOeElement(req.params.id);
      
      // Log activity if element existed
      if (element) {
        await storage.logActivity({
          userId,
          action: 'deleted',
          entityType: 'element',
          entityId: element.id,
          entityName: element.title,
          description: `Deleted OE element "${element.title}"`,
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE element:", error);
      res.status(500).json({ message: "Failed to delete OE element" });
    }
  });

  // OE Processes routes - Now accessible to guests
  app.get('/api/oe-processes', async (req, res) => {
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

  app.get('/api/oe-processes/:id', async (req, res) => {
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

  app.post('/api/oe-processes', async (req: any, res) => {
    try {
      const userId = 'agent_user'; // Use consistent guest user ID since no auth required
      
      // Handle issueDate field  
      if (req.body.issueDate && typeof req.body.issueDate === 'string' && req.body.issueDate.trim() !== '') {
        // Convert valid date string to Date object
        req.body.issueDate = new Date(req.body.issueDate);
      } else if (req.body.issueDate === '' || req.body.issueDate === null || req.body.issueDate === undefined) {
        // Remove empty/null issueDate field entirely to avoid validation issues
        delete req.body.issueDate;
      }
      
      const dataToValidate = {
        ...req.body,
        createdBy: userId,
      };
      
      // Handle empty elementId
      if (!dataToValidate.elementId || dataToValidate.elementId === "") {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: [{ message: "Element ID is required", path: ["elementId"] }] 
        });
      }

      const validatedData = insertOeProcessSchema.parse(dataToValidate);
      const process = await storage.createOeProcess(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'created',
        entityType: 'process',
        entityId: process.id,
        entityName: process.name,
        description: `Created process "${process.name}"`,
      });
      
      res.status(201).json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating OE process:", error);
      res.status(500).json({ message: "Failed to create OE process" });
    }
  });

  app.put('/api/oe-processes/:id', async (req, res) => {
    try {
      // Extract steps and performance measures from request body first
      const { steps = [], performanceMeasures: measuresData = [], ...processData } = req.body;
      
      // Handle issueDate field
      if (processData.issueDate && typeof processData.issueDate === 'string' && processData.issueDate.trim() !== '') {
        // Convert valid date string to Date object
        processData.issueDate = new Date(processData.issueDate);
      } else if (processData.issueDate === '' || processData.issueDate === null || processData.issueDate === undefined) {
        // Remove empty/null issueDate field entirely to avoid validation issues
        delete processData.issueDate;
      }
      
      const validatedData = insertOeProcessSchema.partial().parse(processData);
      
      // Update the main process
      const process = await storage.updateOeProcess(req.params.id, validatedData);
      
      // Handle process steps: always delete existing and recreate
      // Delete existing steps for this process
      await db.delete(processSteps).where(eq(processSteps.processId, req.params.id));
      
      // Create new steps if provided
      if (steps.length > 0) {
        for (const step of steps) {
          await storage.createProcessStep({
            processId: req.params.id,
            stepNumber: step.stepNumber || 1,
            stepName: step.stepName || '',
            stepDetails: step.stepDetails || '',
            responsibilities: step.responsibilities || '',
            references: step.references || '',
          });
        }
      }
      
      // Handle performance measures: always delete existing and recreate
      // Delete existing measures for this process
      await db.delete(performanceMeasures).where(eq(performanceMeasures.processId, req.params.id));
      
      // Create new measures if provided
      if (measuresData.length > 0) {
        for (const measure of measuresData) {
          await storage.createPerformanceMeasure({
            processId: req.params.id,
            measureName: measure.measureName || 'Untitled Measure',
            formula: measure.formula || '',
            source: measure.source || '',
            frequency: measure.frequency || '',
            target: measure.target || '',
            scorecardCategory: measure.scorecardCategory || '',
            strategicGoalId: measure.strategicGoalId === 'none' || !measure.strategicGoalId ? null : measure.strategicGoalId,
          });
        }
      }
      
      res.json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating OE process:", error);
      res.status(500).json({ message: "Failed to update OE process" });
    }
  });

  app.patch('/api/oe-processes/:id', async (req, res) => {
    try {
      // Handle issueDate field
      if (req.body.issueDate && typeof req.body.issueDate === 'string' && req.body.issueDate.trim() !== '') {
        // Convert valid date string to Date object
        req.body.issueDate = new Date(req.body.issueDate);
      } else if (req.body.issueDate === '' || req.body.issueDate === null || req.body.issueDate === undefined) {
        // Remove empty/null issueDate field entirely to avoid validation issues
        delete req.body.issueDate;
      }
      
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

  app.delete('/api/oe-processes/:id', async (req: any, res) => {
    try {
      const userId = req.user?.id || 'agent_user';
      
      // Get process details before deletion for logging
      const process = await storage.getOeProcess(req.params.id);
      
      await storage.deleteOeProcess(req.params.id);
      
      // Log activity if process existed
      if (process) {
        await storage.logActivity({
          userId,
          action: 'deleted',
          entityType: 'process',
          entityId: process.id,
          entityName: process.name,
          description: `Deleted process "${process.name}"`,
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting OE process:", error);
      res.status(500).json({ message: "Failed to delete OE process" });
    }
  });

  // Process Steps routes
  app.get('/api/oe-processes/:processId/steps', async (req, res) => {
    try {
      const steps = await storage.getProcessSteps(req.params.processId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching process steps:", error);
      res.status(500).json({ message: "Failed to fetch process steps" });
    }
  });

  app.post('/api/oe-processes/:processId/steps', async (req, res) => {
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

  app.put('/api/process-steps/:id', async (req, res) => {
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

  app.delete('/api/process-steps/:id', async (req, res) => {
    try {
      await storage.deleteProcessStep(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting process step:", error);
      res.status(500).json({ message: "Failed to delete process step" });
    }
  });

  // Performance Measures routes
  app.get('/api/oe-processes/:processId/measures', async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasures(req.params.processId);
      res.json(measures);
    } catch (error) {
      console.error("Error fetching performance measures:", error);
      res.status(500).json({ message: "Failed to fetch performance measures" });
    }
  });

  app.post('/api/oe-processes/:processId/measures', async (req: any, res) => {
    try {
      const userId = 'agent_user'; // Use consistent guest user ID since no auth required
      const validatedData = insertPerformanceMeasureSchema.parse({
        ...req.body,
        processId: req.params.processId,
      });
      const measure = await storage.createPerformanceMeasure(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'created',
        entityType: 'performance_measure',
        entityId: measure.id,
        entityName: measure.measureName,
        description: `Created performance measure "${measure.measureName}"`,
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

  app.put('/api/performance-measures/:id', async (req, res) => {
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

  app.delete('/api/performance-measures/:id', async (req, res) => {
    try {
      await storage.deletePerformanceMeasure(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting performance measure:", error);
      res.status(500).json({ message: "Failed to delete performance measure" });
    }
  });

  // Document Versions routes
  app.get('/api/oe-processes/:processId/versions', async (req, res) => {
    try {
      const versions = await storage.getDocumentVersions(req.params.processId);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching document versions:", error);
      res.status(500).json({ message: "Failed to fetch document versions" });
    }
  });

  app.post('/api/oe-processes/:processId/versions', async (req: any, res) => {
    try {
      const userId = 'agent_user'; // Use consistent guest user ID since no auth required
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

  // Strategic Goals routes - Now accessible to guests
  app.get('/api/strategic-goals', async (req, res) => {
    try {
      const goals = await storage.getAllStrategicGoals();
      res.json(goals);
    } catch (error) {
      console.error("Error fetching strategic goals:", error);
      res.status(500).json({ message: "Failed to fetch strategic goals" });
    }
  });

  app.get('/api/strategic-goals/element/:elementId', async (req, res) => {
    try {
      const goals = await storage.getStrategicGoalsByElement(req.params.elementId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching strategic goals for element:", error);
      res.status(500).json({ message: "Failed to fetch strategic goals" });
    }
  });

  app.post('/api/strategic-goals', async (req: any, res) => {
    try {
      const userId = req.user.id;
      const goalData = insertStrategicGoalSchema.parse(req.body);
      const goal = await storage.createStrategicGoal(goalData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'created',
        entityType: 'strategic_goal',
        entityId: goal.id,
        entityName: goal.title,
        description: `Created strategic goal "${goal.title}"`,
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

  app.put('/api/strategic-goals/:id', async (req, res) => {
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

  app.delete('/api/strategic-goals/:id', async (req, res) => {
    try {
      await storage.deleteStrategicGoal(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting strategic goal:", error);
      res.status(500).json({ message: "Failed to delete strategic goal" });
    }
  });

  // Element Performance Metrics routes
  app.get('/api/performance-metrics', async (req, res) => {
    try {
      const metrics = await storage.getAllElementPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.get('/api/performance-metrics/element/:elementId', async (req, res) => {
    try {
      const metrics = await storage.getElementPerformanceMetricsByElement(req.params.elementId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics for element:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.post('/api/performance-metrics', async (req, res) => {
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

  app.put('/api/performance-metrics/:id', async (req, res) => {
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

  app.delete('/api/performance-metrics/:id', async (req, res) => {
    try {
      await storage.deleteElementPerformanceMetric(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting performance metric:", error);
      res.status(500).json({ message: "Failed to delete performance metric" });
    }
  });

  // Process performance measures grouped by scorecard category
  app.get('/api/scorecard/performance-measures', async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasuresForScorecard();
      res.json(measures);
    } catch (error) {
      console.error("Error fetching scorecard performance measures:", error);
      res.status(500).json({ message: "Failed to fetch scorecard performance measures" });
    }
  });

  // Process Document routes
  app.get('/api/processes/:processId/documents', async (req, res) => {
    try {
      const documents = await storage.getProcessDocuments(req.params.processId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching process documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/processes/:processId/documents/upload', async (req, res) => {
    try {
      // For now, we'll return a mock upload URL to simulate the upload
      // In production, this would use proper object storage
      const { fileName } = req.body;
      
      if (!fileName) {
        return res.status(400).json({ error: 'fileName is required' });
      }

      // Generate a mock upload URL that will be handled by our document endpoint
      const uploadURL = `/api/mock-upload/${req.params.processId}/${encodeURIComponent(fileName)}`;
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting document upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // Mock upload endpoint for file handling
  app.put('/api/mock-upload/:processId/:fileName', async (req, res) => {
    try {
      // This simulates file upload - in production would save to object storage
      // For now we just return success
      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error in mock upload:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  app.post('/api/processes/:processId/documents', async (req, res) => {
    try {
      const { title, fileName, fileUrl, fileSize, mimeType } = req.body;
      const userId = req.user?.claims?.sub;

      if (!title || !fileName) {
        return res.status(400).json({ error: 'title and fileName are required' });
      }

      // Create a document URL that points to our documents endpoint
      const documentUrl = `/documents/${req.params.processId}/${encodeURIComponent(fileName)}`;

      const document = await storage.addProcessDocument({
        processId: req.params.processId,
        title,
        fileName,
        fileUrl: documentUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        uploadedBy: userId,
      });

      // Log activity
      await storage.logActivity({
        userId,
        action: 'created',
        entityType: 'document',
        entityId: document.id,
        entityName: document.title,
        description: `Attached document "${document.title}" to process`,
      });

      res.status(201).json(document);
    } catch (error) {
      console.error('Error adding process document:', error);
      res.status(500).json({ error: 'Failed to add document' });
    }
  });

  app.get('/documents/:processId/:fileName', async (req, res) => {
    try {
      // For now, return a simple response indicating the document
      // In production, this would serve the actual file from object storage
      const { processId, fileName } = req.params;
      
      res.status(200).json({ 
        message: 'Document download placeholder',
        processId,
        fileName,
        note: 'In production, this would serve the actual file content'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      return res.status(500).json({ error: 'Failed to download document' });
    }
  });

  app.delete('/api/documents/:documentId', async (req, res) => {
    try {
      await storage.deleteProcessDocument(req.params.documentId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
