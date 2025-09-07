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
  insertStrategicGoalSchema,
  insertElementPerformanceMetricSchema,
  insertActivityLogSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add headers for preview/iframe support
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *.replit.dev *.replit.com");
    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Agent authentication endpoint (simple username/password for agents)
  app.post('/agent-login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple hardcoded credentials for agents (in production, use environment variables)
    if (username === 'agent_user' && password === 'agent_access_2024') {
      // Set a simple session flag for agent authentication
      (req.session as any).isAgent = true;
      (req.session as any).agentId = 'agent_user';
      res.json({ 
        success: true, 
        message: 'Agent authenticated successfully',
        sessionId: req.sessionID
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid agent credentials' });
    }
  });

  // Enhanced authentication middleware that allows both OAuth users and agents
  const isAuthenticatedOrAgent: typeof isAuthenticated = async (req, res, next) => {
    // Check if user is an authenticated agent
    if ((req.session as any)?.isAgent) {
      return next();
    }
    
    // Otherwise, use normal OAuth authentication
    return isAuthenticated(req, res, next);
  };

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

  // Auth routes - Updated to allow agent access
  app.get('/api/auth/user', isAuthenticatedOrAgent, async (req: any, res) => {
    // Handle agent users differently
    if ((req.session as any)?.isAgent) {
      return res.json({
        id: 'agent_user',
        email: 'agent@system.local',
        firstName: 'Agent',
        lastName: 'User',
        profileImageUrl: null
      });
    }
    
    // Regular OAuth user
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
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
  app.get('/api/mindmap/elements', isAuthenticatedOrAgent, async (req, res) => {
    try {
      const elements = await storage.getOeElementsForMindMap();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching OE elements for mind map:", error);
      res.status(500).json({ message: "Failed to fetch OE elements for mind map" });
    }
  });

  // Get strategic goals with linked processes for Goals-to-Processes mind map
  app.get('/api/mindmap/goals-processes', isAuthenticatedOrAgent, async (req, res) => {
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

  app.post('/api/oe-elements', isAuthenticatedOrAgent, async (req: any, res) => {
    try {
      const userId = (req.session as any)?.isAgent ? 'agent_user' : req.user.claims.sub;
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

  app.delete('/api/oe-elements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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

  app.post('/api/oe-processes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Convert issueDate string to Date object if provided
      if (req.body.issueDate && typeof req.body.issueDate === 'string') {
        req.body.issueDate = new Date(req.body.issueDate);
      }
      
      const validatedData = insertOeProcessSchema.parse({
        ...req.body,
        createdBy: userId,
      });
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

  app.put('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      // Convert issueDate string to Date object if provided
      if (req.body.issueDate && typeof req.body.issueDate === 'string') {
        req.body.issueDate = new Date(req.body.issueDate);
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

  app.patch('/api/oe-processes/:id', isAuthenticated, async (req, res) => {
    try {
      // Convert issueDate string to Date object if provided
      if (req.body.issueDate && typeof req.body.issueDate === 'string') {
        req.body.issueDate = new Date(req.body.issueDate);
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

  app.delete('/api/oe-processes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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

  app.post('/api/oe-processes/:processId/measures', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/strategic-goals/element/:elementId', isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getStrategicGoalsByElement(req.params.elementId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching strategic goals for element:", error);
      res.status(500).json({ message: "Failed to fetch strategic goals" });
    }
  });

  app.post('/api/strategic-goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put('/api/strategic-goals/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/strategic-goals/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStrategicGoal(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting strategic goal:", error);
      res.status(500).json({ message: "Failed to delete strategic goal" });
    }
  });

  // Element Performance Metrics routes
  app.get('/api/performance-metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getAllElementPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.get('/api/performance-metrics/element/:elementId', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getElementPerformanceMetricsByElement(req.params.elementId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics for element:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.post('/api/performance-metrics', isAuthenticated, async (req, res) => {
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

  app.put('/api/performance-metrics/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/performance-metrics/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteElementPerformanceMetric(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting performance metric:", error);
      res.status(500).json({ message: "Failed to delete performance metric" });
    }
  });

  // Process performance measures grouped by scorecard category
  app.get('/api/scorecard/performance-measures', isAuthenticated, async (req, res) => {
    try {
      const measures = await storage.getPerformanceMeasuresForScorecard();
      res.json(measures);
    } catch (error) {
      console.error("Error fetching scorecard performance measures:", error);
      res.status(500).json({ message: "Failed to fetch scorecard performance measures" });
    }
  });

  // Process Document routes
  app.get('/api/processes/:processId/documents', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getProcessDocuments(req.params.processId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching process documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/processes/:processId/documents/upload', isAuthenticated, async (req, res) => {
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
  app.put('/api/mock-upload/:processId/:fileName', isAuthenticated, async (req, res) => {
    try {
      // This simulates file upload - in production would save to object storage
      // For now we just return success
      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error in mock upload:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  app.post('/api/processes/:processId/documents', isAuthenticated, async (req, res) => {
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

  app.get('/documents/:processId/:fileName', isAuthenticated, async (req, res) => {
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

  app.delete('/api/documents/:documentId', isAuthenticated, async (req, res) => {
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
