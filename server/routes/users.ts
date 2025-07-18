import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from "../middleware/auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";
import { validateUser, validateParams, sanitizeAllInputs } from "../middleware/input-validation";
import { asyncHandler, successResponse, createdResponse, updatedResponse, notFoundError, validationError } from "../middleware/error-handling";
import { logger } from "../services/logger";

const router = Router();

// Schema for creating/updating users
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["super_admin", "company_admin", "technician"]),
  companyId: z.number().nullable(),
  active: z.boolean().default(true),
});

// Get all users (super admins see all, company admins see only their company's users)
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    let users;

    if (user.role === "super_admin") {
      // Super admins can see all users
      users = await storage.getAllUsers();
      
      // Fetch company names for each user
      const companies = await storage.getAllCompanies();
      users = users.map(user => {
        const company = companies.find(c => c.id === user.companyId);
        return {
          ...user,
          companyName: company ? company.name : null
        };
      });
    } else if (user.role === "company_admin") {
      // Company admins can only see users in their company
      if (!user.companyId) {
        return res.status(400).json({ message: "User has no company assigned" });
      }
      
      users = await storage.getUsersByCompany(user.companyId);
      const company = await storage.getCompany(user.companyId);
      
      // Add company name to each user
      users = users.map(user => ({
        ...user,
        companyName: company ? company.name : null
      }));
    } else {
      // Technicians can't see user list
      return res.status(403).json({ message: "Not authorized to view users" });
    }

    res.json(users);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get a specific user
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user!;
    
    // Get the requested user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check authorization
    if (
      currentUser.role !== "super_admin" && 
      !(currentUser.role === "company_admin" && currentUser.companyId === user.companyId) &&
      currentUser.id !== userId
    ) {
      return res.status(403).json({ message: "Not authorized to view this user" });
    }
    
    // If user is found and authorized, return the user
    res.json(user);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Create a new user
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    
    // Validate request body
    const validationResult = userSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const userData = validationResult.data;
    
    // Authorization checks
    if (userData.role === "super_admin" && currentUser.role !== "super_admin") {
      return res.status(403).json({ message: "Only super admins can create super admin users" });
    }
    
    if (currentUser.role === "company_admin") {
      // Company admins can only create users for their own company
      if (userData.companyId !== currentUser.companyId) {
        userData.companyId = currentUser.companyId;
      }
      
      // Company admins can't create other company admins
      if (userData.role === "company_admin") {
        return res.status(403).json({ message: "Company admins cannot create other company admins" });
      }
    }
    
    // Check if username or email already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Hash password
    if (!userData.password) {
      return res.status(400).json({ message: "Password is required when creating a user" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create the user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
router.put("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user!;
    
    // Validate request body
    const validationResult = userSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const userData = validationResult.data;
    
    // Get the user to update
    const userToUpdate = await storage.getUser(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Authorization checks
    if (currentUser.role !== "super_admin") {
      // Only super admins can update super admins
      if (userToUpdate.role === "super_admin") {
        return res.status(403).json({ message: "Only super admins can update super admin users" });
      }
      
      // Only super admins can change a user to super admin
      if (userData.role === "super_admin") {
        return res.status(403).json({ message: "Only super admins can create super admin users" });
      }
      
      // Company admins can only update users in their company
      if (currentUser.role === "company_admin") {
        if (userToUpdate.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "You can only update users in your company" });
        }
        
        // Company admins can't update other company admins
        if (userToUpdate.role === "company_admin" && userToUpdate.id !== currentUser.id) {
          return res.status(403).json({ message: "Company admins cannot update other company admins" });
        }
        
        // Company admins can't change company ID
        if (userData.companyId !== currentUser.companyId) {
          userData.companyId = currentUser.companyId;
        }
        
        // Company admins can't promote users to company admin
        if (userToUpdate.role !== "company_admin" && userData.role === "company_admin") {
          return res.status(403).json({ message: "Company admins cannot promote users to company admin" });
        }
      }
      
      // Regular users can only update their own profile
      if (currentUser.role === "technician" && userId !== currentUser.id) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
    }
    
    // Hash password if provided
    let updatedUserData: any = { ...userData };
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedUserData.password = await bcrypt.hash(userData.password, salt);
    } else {
      // Remove password from update data if not provided
      delete updatedUserData.password;
    }
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, updatedUserData);
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (activate/deactivate)
router.patch("/:id/status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user!;
    const { active } = req.body;
    
    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "Active status must be a boolean" });
    }
    
    // Get the user to update
    const userToUpdate = await storage.getUser(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Authorization checks
    if (userId === currentUser.id) {
      return res.status(403).json({ message: "You cannot change your own active status" });
    }
    
    if (currentUser.role !== "super_admin") {
      // Only super admins can update super admins
      if (userToUpdate.role === "super_admin") {
        return res.status(403).json({ message: "Only super admins can update super admin users" });
      }
      
      // Company admins can only update users in their company
      if (currentUser.role === "company_admin") {
        if (userToUpdate.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "You can only update users in your company" });
        }
        
        // Company admins can't update other company admins
        if (userToUpdate.role === "company_admin") {
          return res.status(403).json({ message: "Company admins cannot update other company admins" });
        }
      }
      
      // Regular users can't update active status
      if (currentUser.role === "technician") {
        return res.status(403).json({ message: "Not authorized to change user status" });
      }
    }
    
    // Update the user status
    const updatedUser = await storage.updateUser(userId, { active });
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user status" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;