import { storage } from '../storage';
import bcrypt from 'bcrypt';
import { log } from '../vite';
import { generateBlogPost } from '../ai/index';

/**
 * Utility function to create sample data for demonstration purposes
 */
export async function createSampleData() {
  try {
    log('Creating sample data...', 'info');
    
    // Create a demo company
    const demoCompany = await storage.createCompany({
      name: 'Demo Home Services',
      plan: 'pro',
      usageLimit: 100,
    });
    
    log(`Review request email sent successfully`, 'info');

    // Create an admin user for the demo company
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);
    
    const demoAdmin = await storage.createUser({
      email: 'admin@demohomeservices.com',
      username: 'demoadmin',
      password: hashedPassword,
      role: 'company_admin',
      companyId: demoCompany.id,
    });

    log(`Review request email sent successfully`, 'info');
    
    // Create some technicians
    const technicians = [
      {
        name: 'John Smith',
        email: 'john@demoservices.com',
        phone: '555-123-4567',
        specialty: 'Plumbing',
        companyId: demoCompany.id,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@demoservices.com',
        phone: '555-234-5678',
        specialty: 'Electrical',
        companyId: demoCompany.id,
      },
      {
        name: 'Mike Taylor',
        email: 'mike@demoservices.com',
        phone: '555-345-6789',
        specialty: 'HVAC',
        companyId: demoCompany.id,
      }
    ];
    
    const createdTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        const technician = await storage.createTechnician(tech);
        log(`Review request email sent successfully`, 'info');
        return technician;
      })
    );

    // Create check-ins for each technician
    const checkInTemplates = [
      {
        technicianIndex: 0,
        jobType: 'plumbing',
        location: '123 Main St, Anytown, USA',
        notes: 'Fixed leaky faucet in master bathroom. Replaced worn out washer and adjusted water pressure. Customer very satisfied with quick service.',
        latitude: '37.7749',
        longitude: '-122.4194',
        photos: [],
        createBlog: true
      },
      {
        technicianIndex: 1,
        jobType: 'electrical',
        location: '456 Oak Avenue, Sometown, USA',
        notes: 'Replaced old circuit breaker panel with new 200 amp service. Updated wiring to code and installed new GFCI outlets in kitchen and bathrooms. Job took full day but finished on schedule.',
        latitude: '37.7850',
        longitude: '-122.4320',
        photos: [],
        createBlog: true
      },
      {
        technicianIndex: 2,
        jobType: 'hvac',
        location: '789 Pine Street, Othertown, USA',
        notes: 'Annual maintenance on HVAC system. Cleaned condenser coils, replaced air filter, and checked refrigerant levels. System is running efficiently. Recommended customer replace system within next 2 years due to age.',
        latitude: '37.7651',
        longitude: '-122.4156',
        photos: [],
        createBlog: true
      },
      {
        technicianIndex: 0,
        jobType: 'plumbing',
        location: '101 River Road, Lakeside, USA',
        notes: 'Unclogged main sewer line using power auger. Discovered tree root intrusion as cause. Recommended customer schedule regular maintenance to prevent future blockages.',
        latitude: '37.7850',
        longitude: '-122.4000',
        photos: [],
        createBlog: false
      },
      {
        technicianIndex: 1,
        jobType: 'electrical',
        location: '202 Mountain View, Highland, USA',
        notes: 'Installed new ceiling fans in three bedrooms. Also replaced outdated light fixtures in hallway with new LED models. Customer very pleased with energy-efficient upgrades.',
        latitude: '37.7950',
        longitude: '-122.4100',
        photos: [],
        createBlog: false
      }
    ];

    // Create check-ins
    for (const template of checkInTemplates) {
      const technician = createdTechnicians[template.technicianIndex];
      
      const checkIn = await storage.createCheckIn({
        technicianId: technician.id,
        companyId: demoCompany.id,
        jobType: template.jobType,
        notes: template.notes,
        location: template.location,
        latitude: template.latitude,
        longitude: template.longitude,
        photos: template.photos,
        isBlog: false
      });
      
      log(`Review request email sent successfully`, 'info');
      
      // Create blog post for selected check-ins
      if (template.createBlog) {
        try {
          // Generate blog post using AI
          const blogResult = await generateBlogPost({
            jobType: checkIn.jobType,
            notes: checkIn.notes || '',
            location: checkIn.location || undefined,
            technicianName: technician.name
          });
          
          // Create blog post - ensure photos property is not undefined
          const blogPost = await storage.createBlogPost({
            title: blogResult.title,
            placeholder: blogResult.placeholder,
            companyId: demoCompany.id,
            checkInId: checkIn.id,
            photos: checkIn.photos || []
          });
          
          log(`Review request email sent successfully`, 'info');
          
          // Mark check-in as having been made into a blog post
          await storage.updateCheckIn(checkIn.id, { isBlog: true });
        } catch (error) {
          log(`Review request email sent successfully`, 'error');
        }
      }
      
      // Create some review requests
      if (template.technicianIndex === 0 || template.technicianIndex === 1) {
        const reviewRequest = await storage.createReviewRequest({
          companyId: demoCompany.id,
          technicianId: technician.id,
          method: 'email',
          customerName: template.technicianIndex === 0 ? 'Alex Johnson' : 'Maya Rodriguez',
          email: template.technicianIndex === 0 ? 'alex.johnson@gmail.com' : 'maya.patel@yahoo.com',
          phone: null
        });
        
        log(`Review request email sent successfully`, 'info');
      }
    }
    
    log('Sample data creation complete!', 'info');
    return {
      companyId: demoCompany.id,
      adminEmail: demoAdmin.email,
      adminPassword: 'demo123',
      message: 'Sample data created successfully'
    };
  } catch (error) {
    log(`Review request email sent successfully`, 'error');
    throw error;
  }
}