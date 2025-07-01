# Rank It Pro - SaaS Platform

## Overview

Rank It Pro is a comprehensive SaaS platform designed for home service companies to manage their business operations, track technician performance, and generate AI-powered content for online marketing. The platform provides multi-role authentication, subscription management, review automation, and mobile-first technician interfaces.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds
- **Mobile Support**: Capacitor for iOS/Android deployment

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **API Design**: RESTful endpoints with role-based access control

### Mobile Architecture
- **Framework**: Capacitor for cross-platform mobile apps
- **Platforms**: iOS and Android support
- **Features**: Camera integration, geolocation, push notifications
- **Deployment**: APK generation for Android, App Store ready for iOS

## Key Components

### Authentication System
- Multi-role authentication (super_admin, company_admin, technician, sales_staff)
- Session-based authentication with secure cookie management
- Password hashing with bcrypt (12 rounds)
- Role-based routing and access control

### Database Schema
- **Users**: Core user management with role-based permissions
- **Companies**: Multi-tenant company management with subscription plans
- **Technicians**: Field worker profiles and performance tracking
- **Check-ins**: Job completion tracking with photo/audio uploads
- **Sales System**: Commission tracking and sales staff management
- **Subscription Plans**: Tiered pricing with feature limitations

### Business Logic
- **Subscription Management**: Starter, Professional, and Enterprise plans
- **Review Automation**: Automated customer review request system
- **AI Content Generation**: Blog post and testimonial creation
- **WordPress Integration**: Automated content publishing
- **Commission Tracking**: Sales staff performance and earnings

## Data Flow

### User Authentication Flow
1. User submits credentials via login form
2. Server validates against database using bcrypt
3. Session cookie established for authenticated requests
4. Role-based dashboard routing (admin → /admin, technician → /mobile)

### Technician Check-in Flow
1. Technician authenticates via mobile interface
2. Location captured via GPS
3. Job photos uploaded via camera integration
4. Customer information and service details submitted
5. AI-powered content generation triggered
6. Review request automation initiated

### Content Generation Flow
1. Check-in data processed by AI service (Anthropic Claude)
2. Blog post and testimonial content generated
3. WordPress API integration publishes content
4. SEO optimization and social media scheduling

## External Dependencies

### Core Services
- **Database**: Neon PostgreSQL (production) / Local PostgreSQL (development)
- **AI Service**: Anthropic Claude API for content generation
- **Payment Processing**: Stripe for subscription management
- **Email Service**: SendGrid for transactional emails

### Third-party Integrations
- **WordPress API**: Automated content publishing
- **Google Analytics**: Performance tracking
- **Notion API**: Content management and documentation
- **Capacitor Plugins**: Camera, geolocation, device access

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Drizzle ORM**: Type-safe database operations
- **ESBuild**: Fast backend compilation
- **Vite**: Frontend development and building

## Deployment Strategy

### Production Environment
- **Platform**: Render.com for automated deployments
- **Database**: Neon serverless PostgreSQL
- **CDN**: Built-in static asset serving
- **SSL**: Automated certificate management

### Build Process
1. TypeScript compilation for server code
2. Vite build for client application
3. Static asset optimization and bundling
4. Database migration execution
5. Environment variable configuration

### Development Environment
- Local PostgreSQL database
- Hot reload for both frontend and backend
- TypeScript watch mode
- Development-specific environment variables

## Changelog
- June 30, 2025. Initial setup
- June 30, 2025. Completed major project cleanup - removed 1,100+ unnecessary documentation files, test files, and temporary assets to streamline the codebase
- January 1, 2025. **Chat Support System Fixed** - Resolved WebSocket connection issues, fixed chat widget functionality, support agent availability working correctly, chat sessions creating with proper company details, message exchange functional between company admin and support agent
- January 1, 2025. **Production Build Issues Resolved** - Fixed duplicate class member errors in storage.ts, reducing build errors from multiple failures to 1 warning and 2 errors. Removed duplicate methods: createSupportAgent, createChatSession, createChatMessage, getSupportAgentByUserId, closeChatSession, updateSupportAgentStatus. Ready for Render.com deployment.
- January 1, 2025. **Render.com Deployment Fixed** - Resolved babel and lightningcss dependency issues by creating custom build scripts (build-server.js, build.sh) that exclude problematic external dependencies. Updated render.yaml to use custom build process. Production deployment ready.
- January 1, 2025. **Production Build Script Updated** - Enhanced build.sh with inline esbuild command to ensure Render.com uses correct external dependency exclusions. Fixed permission issues and tested successful builds. Ready for final deployment attempt.
- January 1, 2025. **Deployment Configuration Optimized** - Updated build.sh with comprehensive external dependency exclusions including typescript, @babel/core, and *.node files. Enhanced build process with direct npx calls and comprehensive error handling. Server bundle building successfully at 16MB indicating proper dependency bundling.

## User Preferences

Preferred communication style: Simple, everyday language.