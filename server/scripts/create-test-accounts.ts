import { storage } from "../storage";
import bcrypt from "bcrypt";
import { log } from "../vite";

// Create test accounts for the application
export async function createTestAccounts() {
  log("Starting test account creation...", "setup");
  
  try {
    // Create test company if it doesn't exist
    let testCompany = await storage.getCompanyByName("Test Company");
    let companyId = 0;
    
    if (!testCompany) {
      testCompany = await storage.createCompany({
        name: "Test Company",
        plan: "pro",
        usageLimit: 100,
      });
      companyId = testCompany.id;
      log(`Created test company: Test Company (ID: ${companyId})`, "setup");
    } else {
      companyId = testCompany.id;
      log(`Test company already exists (ID: ${companyId})`, "setup");
    }
    
    // Create company admin if it doesn't exist
    const existingAdmin = await storage.getUserByEmail("admin@testcompany.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("company123", 10);
      const adminUser = await storage.createUser({
        email: "admin@testcompany.com",
        username: "testadmin",
        password: hashedPassword,
        role: "company_admin",
        companyId,
      });
      log(`Created company admin account (ID: ${adminUser.id})`, "setup");
      log("Email: admin@testcompany.com", "setup");
      log("Password: company123", "setup");
    } else {
      log("Company admin account already exists", "setup");
    }
    
    // Create technician if it doesn't exist
    const existingTech = await storage.getUserByEmail("tech@testcompany.com");
    if (!existingTech) {
      // Create technician record
      const newTechnician = await storage.createTechnician({
        name: "Test Technician",
        email: "tech@testcompany.com",
        phone: "555-555-5555",
        companyId: companyId,
      });
      
      // Create user account for technician
      const hashedPassword = await bcrypt.hash("tech1234", 10);
      const techUser = await storage.createUser({
        email: "tech@testcompany.com",
        username: "testtechnician",
        password: hashedPassword,
        role: "technician",
        companyId: companyId,
      });
      
      // Update technician record with user ID
      await storage.updateTechnician(newTechnician.id, {
        userId: techUser.id
      });
      
      log(`Created technician account (ID: ${techUser.id})`, "setup");
      log("Email: tech@testcompany.com", "setup");
      log("Password: tech1234", "setup");
    } else {
      log("Technician account already exists", "setup");
    }
    
    log("Test account creation completed successfully", "setup");
    return true;
  } catch (error) {
    console.error("Error creating test accounts:", error);
    return false;
  }
}

// Export a function to run directly
export async function runCreateTestAccounts() {
  await createTestAccounts();
  // Exit the process when run directly
  process.exit(0);
}

// Note: We don't need a direct run check in an ES module
// This will be imported and called from our server startup