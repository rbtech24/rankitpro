import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

import { logger } from '../services/logger';
const router = Router();

// Customer schema for validation
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// In-memory storage for customer data (in a real app, this would be in the database)
// This is just for demonstration purposes
const customers = new Map<number, Array<{
  id: number;
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}>>();

// Initialize with some demo data
function initializeDemoCustomers() {
  // Create customer lists for companies 1, 2, and 3
  [1, 2, 3].forEach(companyId => {
    const companyCustomers = [];
    
    // Add 10 sample customers for each company
    for (let i = 1; i <= 10; i++) {
      companyCustomers.push({
        id: (companyId - 1) * 10 + i,
        companyId,
        name: `Customer converted)`,
        email: `customerconverted.com`,
        phone: `555-converted`,
        address: `converted Main St`,
        city: `City converted`,
        state: `State converted`,
        zipCode: `converted`,
        notes: `Sample customer converted`,
        tags: [`frequent`, `companyconverted`],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    customers.set(companyId, companyCustomers);
  });
}

// Call initialization
initializeDemoCustomers();

let nextCustomerId = 31; // After demo data

// Get all customers for the technician's company
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Get query parameters for filtering
    const { search, sort, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    
    // Get company's customers
    let companyCustomers = customers.get(companyId) || [];
    
    // Apply search filter if provided
    if (search) {
      const searchStr = (search as string).toLowerCase();
      companyCustomers = companyCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchStr) ||
        (customer.email && customer.email.toLowerCase().includes(searchStr)) ||
        (customer.phone && customer.phone.includes(searchStr)) ||
        (customer.address && customer.address.toLowerCase().includes(searchStr))
      );
    }
    
    // Apply sorting
    if (sort === 'name') {
      companyCustomers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recent') {
      companyCustomers.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    
    // Get check-ins for each customer
    const checkIns = await storage.getCheckInsByCompany(companyId);
    
    // Create a map of customer names to their check-ins
    const customerCheckInCounts = new Map<string, number>();
    
    checkIns.forEach(checkIn => {
      if (checkIn.customerName) {
        const count = customerCheckInCounts.get(checkIn.customerName) || 0;
        customerCheckInCounts.set(checkIn.customerName, count + 1);
      }
    });
    
    // Apply pagination and add check-in counts
    const paginatedCustomers = companyCustomers
      .slice(startIndex, startIndex + limitNum)
      .map(customer => ({
        ...customer,
        checkInCount: customerCheckInCounts.get(customer.name) || 0
      }));
    
    res.json({
      total: companyCustomers.length,
      page: pageNum,
      limit: limitNum,
      items: paginatedCustomers
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific customer
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
    
    const companyId = req.user.companyId;
    
    // Get company's customers
    const companyCustomers = customers.get(companyId) || [];
    
    // Find the specific customer
    const customer = companyCustomers.find(c => c.id === customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Get check-ins for this customer by name match
    const checkIns = await storage.getCheckInsByCompany(companyId);
    const customerCheckIns = checkIns.filter(checkIn => 
      checkIn.customerName === customer.name || 
      checkIn.customerEmail === customer.email
    );
    
    // Get review responses for this customer by name match
    const reviewResponses = await storage.getReviewResponsesByCompany(companyId);
    const customerReviews = reviewResponses.filter(review => 
      review.customerName === customer.name
    );
    
    res.json({
      ...customer,
      checkIns: customerCheckIns.map(checkIn => ({
        id: checkIn.id,
        jobType: checkIn.jobType,
        date: checkIn.createdAt,
        technicianId: checkIn.technicianId,
        notes: checkIn.notes
      })),
      reviews: customerReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        feedback: review.feedback,
        date: review.respondedAt,
        technicianId: review.technicianId
      }))
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new customer
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const data = customerSchema.parse(req.body);
    const companyId = req.user.companyId;
    
    // Create the new customer
    const newCustomer = {
      id: nextCustomerId++,
      companyId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Get or initialize the company's customers
    if (!customers.has(companyId)) {
      customers.set(companyId, []);
    }
    
    // Add the new customer
    customers.get(companyId)?.push(newCustomer);
    
    res.status(201).json(newCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a customer
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
    
    const updates = customerSchema.partial().parse(req.body);
    const companyId = req.user.companyId;
    
    // Get company's customers
    const companyCustomers = customers.get(companyId) || [];
    
    // Find the customer index
    const customerIndex = companyCustomers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Update the customer
    const updatedCustomer = {
      ...companyCustomers[customerIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    companyCustomers[customerIndex] = updatedCustomer;
    
    res.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Search customers by name, email, or phone
router.get('/search/:query', isAuthenticated, async (req, res) => {
  try {
    const searchQuery = req.params.query.toLowerCase();
    const companyId = req.user.companyId;
    
    // Get company's customers
    const companyCustomers = customers.get(companyId) || [];
    
    // Search for matches
    const results = companyCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery)) ||
      (customer.phone && customer.phone.includes(searchQuery))
    );
    
    res.json(results.slice(0, 10)); // Limit to top 10 results
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer history (check-ins and reviews)
router.get('/:id/history', isAuthenticated, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
    
    const companyId = req.user.companyId;
    
    // Get company's customers
    const companyCustomers = customers.get(companyId) || [];
    
    // Find the specific customer
    const customer = companyCustomers.find(c => c.id === customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Get all check-ins for this company
    const checkIns = await storage.getCheckInsByCompany(companyId);
    
    // Filter for this customer (by name match)
    const customerCheckIns = checkIns.filter(checkIn => 
      checkIn.customerName === customer.name ||
      checkIn.customerEmail === customer.email
    );
    
    // Sort by date (newest first)
    customerCheckIns.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get all technicians for reference
    const technicians = await storage.getTechniciansByCompany(companyId);
    
    // Map to include technician names
    const historyItems = customerCheckIns.map(checkIn => {
      const technician = technicians.find(tech => tech.id === checkIn.technicianId);
      
      return {
        id: checkIn.id,
        type: 'check-in',
        date: checkIn.createdAt,
        jobType: checkIn.jobType,
        technician: technician ? technician.name : 'Unknown',
        technicianId: checkIn.technicianId,
        notes: checkIn.notes,
        location: checkIn.address
      };
    });
    
    res.json({
      customerId,
      customerName: customer.name,
      history: historyItems
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;