# Rank It Pro - Home Service Business Management Platform

A comprehensive SaaS platform designed for home service businesses with intelligent operational tools, real-time chat support, AI-powered content generation, and seamless WordPress integration.

## Features

- **Mobile Field App**: GPS check-ins, photo documentation, offline capabilities
- **AI Content Generation**: Automated blog posts and SEO content from service visits
- **Internal Chat Support**: Real-time messaging between companies and support agents
- **Review Management**: Automated collection and follow-up systems
- **WordPress Integration**: Seamless content publishing with custom plugin
- **Multi-tenant Architecture**: Company admin and technician role management
- **Progressive Web App**: Offline functionality for field technicians

## Technology Stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js + Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt
- **Real-time**: WebSocket connections
- **AI**: OpenAI, Anthropic Claude, X.AI integration
- **Payments**: Stripe subscription billing

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start development server: `npm run dev`
4. Access the application at `http://localhost:5000`

## Demo Accounts

- **Super Admin**: bill@mrsprinklerrepair.com / SuperAdmin2025!
- **Company Admin**: embed@testcompany.com / EmbedTest2025!
- **Sales Staff**: demo@salesstaff.com / SalesDemo2025!

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared types and database schema
- `/wordpress-plugin` - WordPress integration plugin
- `/rank-it-pro-plugin` - WordPress plugin files

## Deployment

The application is production-ready and deployed at [rankitpro.com](https://rankitpro.com) using Render.com with PostgreSQL database.