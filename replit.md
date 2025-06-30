# Rank It Pro - SaaS Platform Architecture

## Overview

Rank It Pro is a comprehensive mobile-first SaaS platform designed for home service business management. The system provides intelligent operational tools including technician visit tracking, automated review management, AI-powered content generation, and seamless WordPress integration. Built with modern TypeScript, React, and PostgreSQL, it offers enterprise-level authentication, real-time features, and progressive web app capabilities.

**Current Status:** Production-ready application with secure authentication, functional user preferences system, API testing system, super admin account (bill@mrsprinklerrepair.com with password SuperAdmin2025!), and test company admin account for embed generator testing (embed@testcompany.com with password EmbedTest2025!).

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript with Tailwind CSS and Shadcn/UI components
- **Backend**: Node.js + Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Real-time**: WebSocket connections for live updates and notifications
- **AI Integration**: OpenAI, Anthropic Claude, and X.AI for content generation
- **Payment**: Stripe integration for subscription billing
- **Email**: SendGrid service for automated notifications
- **Progressive Web App**: Service worker with offline capabilities

### Database Architecture
The system uses 20+ interconnected PostgreSQL tables supporting:
- **User Management**: users, technicians, companies with role-based access control
- **Service Operations**: check_ins, blog_posts, reviews with GPS tracking
- **AI & Automation**: ai_usage_logs, review_automation with usage tracking
- **WordPress Integration**: wordpress_integrations, custom_fields
- **Sales & Billing**: sales_people, commissions, testimonials
- **System Administration**: api_credentials, monthly_usage

## Key Components

### 1. Authentication System
- **Multi-role Architecture**: Super Admin, Company Admin, and Technician roles
- **Session Management**: PostgreSQL-backed sessions with 2-hour TTL
- **Security Features**: Bcrypt password hashing, secure session cookies, comprehensive middleware
- **Authorization**: Role-based access control at API and component levels

### 2. Mobile-First Technician Interface
- **GPS Check-in System**: Real-time location tracking with manual override capabilities
- **Photo Documentation**: Before/after photo uploads with job documentation
- **Offline Capabilities**: Progressive Web App with service worker for field use
- **Customer Data Collection**: Contact information and service details capture

### 3. AI Content Generation Engine
- **Multi-Provider Support**: OpenAI, Anthropic Claude, and X.AI integration
- **SEO Blog Creation**: Automated content generation from job check-in data
- **Usage Tracking**: Comprehensive logging and limits per subscription plan
- **Content Optimization**: Local SEO focused blog posts and testimonials

### 4. Review Management System
- **Automated Collection**: Email and on-site review request system
- **Follow-up Automation**: Customizable email sequences and timing
- **Review Publishing**: Direct integration with company websites
- **Performance Analytics**: Response rates and review quality tracking

### 5. WordPress Integration
- **Plugin Architecture**: Custom WordPress plugin for seamless integration
- **Webhook System**: Real-time check-in publishing to WordPress sites
- **SEO Optimization**: Automated meta tags, schema markup, and local SEO
- **Custom Fields**: Flexible content mapping and customization

## Data Flow

### Technician Workflow
1. **Check-in Creation**: Technician opens mobile PWA and creates new check-in
2. **GPS & Documentation**: System captures location, photos, and service details
3. **AI Processing**: Job data triggers AI content generation for SEO blog posts
4. **Customer Interaction**: On-site review collection via audio/video testimonials
5. **Automated Publishing**: Content published to WordPress and company websites

### Review Automation Flow
1. **Email Automation**: Automated review request emails sent post-service
2. **Follow-up Sequences**: Customizable timing and messaging templates
3. **Response Tracking**: Monitor customer engagement and response rates
4. **Public Display**: Approved reviews displayed on company testimonial pages

### Admin Management Flow
1. **Company Dashboard**: Real-time analytics and performance metrics
2. **Technician Management**: User creation, assignment, and performance tracking
3. **Content Approval**: Review and approve AI-generated content before publishing
4. **Integration Settings**: Configure WordPress, email, and automation preferences

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage with connection pooling
- **SendGrid Email Service**: Transactional emails and review automation
- **Stripe Payment Processing**: Subscription billing and payment management

### Optional Integrations
- **OpenAI API**: GPT-4 for content generation and AI features
- **Anthropic Claude**: Alternative AI provider for content creation
- **X.AI Grok**: Additional AI model for diverse content styles
- **Twilio SMS**: Optional SMS notifications and alerts

### Third-Party Integrations
- **WordPress Plugin**: Direct content publishing to WordPress sites
- **JavaScript Embed**: Universal widget for any website platform
- **CRM Systems**: Future integration with popular CRM platforms

## Deployment Strategy

### Production Environment
- **Render.com Deployment**: Containerized deployment with auto-scaling
- **Environment Variables**: Secure configuration management for API keys
- **Database Migration**: Automated schema migrations with Drizzle Kit
- **Health Monitoring**: Comprehensive health checks and uptime monitoring

### Security Configuration
- **HTTPS/TLS**: Encrypted connections with secure cookie handling
- **CORS Policy**: Properly configured cross-origin resource sharing
- **Rate Limiting**: API protection with session-based rate limiting
- **Input Validation**: Zod schema validation on all API endpoints

### Performance Optimization
- **Database Indexing**: Optimized queries with proper database indexes
- **Image Compression**: Automated photo optimization and storage
- **Caching Strategy**: Progressive Web App caching for offline functionality
- **CDN Integration**: Static asset delivery optimization

## Changelog

Changelog:
- June 16, 2025. Initial setup
- June 24, 2025. Fixed JSX syntax errors in checkin form component, set up working authentication system with demo accounts
- June 26, 2025. Completed comprehensive production readiness audit and fixes: resolved critical companies management page crashes with null safety checks, fixed financial data accuracy to show real $0 revenue instead of mock values, corrected profile update endpoint functionality, addressed major TypeScript errors for production deployment, implemented proper error handling and type safety across the application. Implemented comprehensive IP blocking system with application-level middleware, admin management interface, and database schema for blocking unwanted traffic at the application layer.
- June 27, 2025. Fixed WordPress plugin API domain configuration - updated default API domain from Replit development URL to production domain (https://rankitpro.com) to resolve HTTP 503 errors when WordPress sites fetch widget data. Created comprehensive landing page highlighting audio/video testimonial collection alongside all platform features, including dedicated testimonial showcase section, customer benefits, and social proof elements. Implemented comprehensive social media integration for Pro and Agency users, enabling automatic posting of service visits, reviews, and testimonials to Facebook, Instagram, Twitter, and LinkedIn with intelligent content generation and complete management interface.
- June 28, 2025. Successfully debugged and fixed ROI calculator routing issue - route was incorrectly placed in authentication-restricted section, moved to public pages section for universal access. Updated ROI calculator with realistic industry-standard numbers: reduced lead increase from unrealistic 3x to credible 35% increase, adjusted review improvement from 85% to sustainable 50%, and reduced time savings claims from 70% to realistic 40% - ensuring all projected benefits align with actual achievable results for home service businesses. Fixed duplicate class member errors in storage.ts by removing duplicate method implementations for getReviewsByCompany, getJobTypesByCompany, getReviewChartData, and getCompanyGrowthData. Production deployment successful at https://rankitpro.com but database connection failing due to internal PostgreSQL URL configuration. COMPREHENSIVE DATABASE SOLUTION: Implemented smart dual-URL database connection system that automatically chooses internal URL (within Render network) or external URL (development/other environments) with intelligent SSL detection. Switched from Neon serverless to standard PostgreSQL with proper connection pooling. Created PRODUCTION-DATABASE-SOLUTION.md with deployment instructions. Fixed ROI button to scroll to top of page when opened from homepage. PRODUCTION DATABASE CONNECTION FULLY RESOLVED: Updated DATABASE_URL in Render environment variables with correct Neon database credentials (npg_oZyLznK7uJm1 password). Fixed session table configuration mismatch - changed from 'sessions' to 'session' and disabled createTableIfMissing to prevent index conflicts. Authentication system now operational in production with login returning 200 status and proper user data.
- June 29, 2025. COMPREHENSIVE SALES STAFF MANAGEMENT SYSTEM COMPLETE: Built complete sales staff management system with full database schema integration, enhanced storage layer with commission tracking and payout processing, comprehensive API routes for sales operations, beautiful sales staff dashboard showing customer list and commission earnings, super admin sales management interface for staff oversight and payout processing, integrated Stripe automated commission payouts to sales staff bank accounts, and role-based routing for both sales staff and super admin access. Created demo sales staff account (demo@salesstaff.com / SalesDemo2025!) for testing the complete workflow. Added Sales Management navigation to super admin sidebar. System provides automated commission tracking when customers make payments, approval workflows for super admins, and direct Stripe payouts to sales staff with comprehensive analytics and reporting. Added Sales Staff login button in footer next to Admin button - Sales Staff button provides clean login access without pre-filled demo credentials, maintaining security while providing easy access. DYNAMIC SUBSCRIPTION PLANS INTEGRATION: Implemented dynamic subscription plans system for sales staff - sales staff company signup now fetches live pricing data from admin-configured database instead of hardcoded values, with yearly pricing showing discount percentages and annual savings matching the main system format. Added /api/sales/subscription-plans endpoint, updated sales dashboard to display yearly pricing prominently with addon structure, defaults to annual billing for best value proposition.
- June 30, 2025. COMPREHENSIVE PRODUCTION DATA INTEGRATION COMPLETE: Systematically eliminated all mock data and placeholder content across the entire platform. Replaced hardcoded revenue calculations in analytics service with real Stripe financial data integration. Removed fake customer testimonials from homepage (critical production readiness issue). Completely rebuilt notification system to load from API instead of mock data. Integrated real-time system health monitoring with actual database connectivity validation and performance metrics. Fixed critical TypeScript errors in storage layer including photo property handling, date validation, and transaction field mapping. All four major integrations (WordPress API, Stripe revenue tracking, system health monitoring, HubSpot CRM) now use authentic data sources instead of synthetic placeholders. Platform now production-ready with genuine data connections throughout all core functionality.

## User Preferences

Preferred communication style: Simple, everyday language.