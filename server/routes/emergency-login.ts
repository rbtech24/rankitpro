import express from 'express';
import { storage } from '../storage';
import bcrypt from 'bcrypt';

const router = express.Router();

// Special emergency login endpoint that doesn't rely on the regular authentication flow
router.post('/emergency-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Emergency login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Retrieve all users and log them for debugging
    const allUsers = await storage.getAllUsers();
    console.log(`All users in system (${allUsers.length}):`);
    allUsers.forEach(user => {
      console.log(`- ${user.id}: ${user.email} (${user.role})`);
    });
    
    // Find the user directly
    const user = allUsers.find(u => u.email === email);
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log(`Found user: ${user.email}, ID: ${user.id}, Role: ${user.role}`);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password verification: ${isPasswordValid ? 'Successful' : 'Failed'}`);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Set session user ID
    if (req.session) {
      (req.session as any).userId = user.id;
      console.log(`Session userId set to: ${user.id}`);
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Load company info if applicable
    let company = undefined;
    if (user.companyId && (user.role === 'company_admin' || user.role === 'technician')) {
      company = await storage.getCompany(user.companyId);
      console.log(`Found company: ${company?.name || 'Not found'}`);
    }
    
    console.log('Emergency login successful');
    res.json({ user: userWithoutPassword, company });
  } catch (error) {
    console.error('Emergency login error:', error);
    res.status(500).json({ message: 'Server error during emergency login', error: String(error) });
  }
});

export default router;