import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCompanySchema, insertCommentSchema, insertDataRequestSchema, insertHolidaySchema, insertFacebookDataRequestSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Company management routes
  app.get("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companies = await storage.getCompaniesByUser(req.user!.id);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user companies" });
    }
  });

  app.get("/api/companies/category/:category", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { category } = req.params;
      const companies = await storage.getCompaniesByCategory(category, req.user!.id);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies by category" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany({
        ...validatedData,
        assignedToUserId: req.user!.id,
      });
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(parseInt(id), validatedData);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can delete companies
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      await storage.deleteCompany(parseInt(id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Comment management routes
  app.get("/api/comments/today", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const comments = await storage.getTodaysCommentsByUser(req.user!.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's comments" });
    }
  });

  app.get("/api/comments/company/:companyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { companyId } = req.params;
      const comments = await storage.getCommentsByCompany(parseInt(companyId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Data request routes
  app.get("/api/data-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const requests = await storage.getDataRequestsByUser(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data requests" });
    }
  });

  app.get("/api/data-requests/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can view pending requests
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const requests = await storage.getPendingDataRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post("/api/data-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertDataRequestSchema.parse(req.body);
      const request = await storage.createDataRequest({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/data-requests/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can update request status
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateDataRequestStatus(
        parseInt(id), 
        status, 
        req.user!.id
      );
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Holiday routes
  app.get("/api/holidays", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const holidays = await storage.getAllHolidays();
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  app.post("/api/holidays", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can create holidays
    if (!["admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const validatedData = insertHolidaySchema.parse(req.body);
      const holiday = await storage.createHoliday(validatedData);
      res.status(201).json(holiday);
    } catch (error) {
      res.status(400).json({ message: "Invalid holiday data" });
    }
  });

  app.delete("/api/holidays/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can delete holidays
    if (!["admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      await storage.deleteHoliday(parseInt(id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Facebook data request routes
  app.get("/api/facebook-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const requests = await storage.getFacebookDataRequestsByUser(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Facebook requests" });
    }
  });

  app.get("/api/facebook-requests/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can view pending requests
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const requests = await storage.getPendingFacebookDataRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending Facebook requests" });
    }
  });

  app.post("/api/facebook-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertFacebookDataRequestSchema.parse(req.body);
      const request = await storage.createFacebookDataRequest({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/facebook-requests/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can update request status
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateFacebookDataRequestStatus(
        parseInt(id), 
        status, 
        req.user!.id
      );
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can view all users
    if (!["tl", "manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can update users
    if (!["manager", "admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(parseInt(id), updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only main admin can delete users
    if (req.user!.role !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Update login time when user accesses dashboard
  app.post("/api/user/login-time", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.updateUserLoginTime(req.user!.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to update login time" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
