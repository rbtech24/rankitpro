# Rank It Pro - Home Service Business Management Platform

A comprehensive SaaS platform for home service businesses featuring GPS-enabled technician visit logging, automated review management, AI-powered content generation, and seamless WordPress integration.

## 🚀 Features

### Core Business Management
- **GPS Visit Logging**: Real-time technician location tracking with photo uploads
- **Review Management**: Automated review request system with customizable templates
- **AI Content Generation**: OpenAI, Claude, and Grok integration for SEO content
- **WordPress Integration**: Direct publishing to WordPress sites
- **JavaScript Embed**: Universal embed code for any website

### User Management
- **Multi-Role System**: Super Admin, Company Admin, and Technician roles
- **Company Management**: Complete business profile and technician management
- **Secure Authentication**: Role-based access control with session management

### Mobile Experience
- **Progressive Web App**: Native app-like experience on iOS and Android
- **Mobile-Optimized Interface**: Responsive design for field technicians
- **Offline Capabilities**: Service worker for offline functionality

### Analytics & Reporting
- **Visit Analytics**: Comprehensive reporting on technician activities
- **Review Tracking**: Monitor review requests and response rates
- **Content Performance**: Track AI-generated content effectiveness

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **AI Integration**: OpenAI, Anthropic Claude, xAI Grok
- **File Storage**: Multer for photo uploads
- **PWA**: Service Worker + Web App Manifest

## 📱 Progressive Web App

Install Rank It Pro as a native app on any device:

### iOS Installation
1. Open in Safari browser
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Android Installation
- Chrome/Edge will show automatic install prompt
- Or use the custom install button in the app

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/rank-it-pro.git
   cd rank-it-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5000
   - Super admin credentials will be displayed in console on first startup

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# AI Services (Optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
XAI_API_KEY=your_xai_api_key

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Payment Processing (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Session Security
SESSION_SECRET=your_secure_session_secret
```

## 📐 Architecture

```
rank-it-pro/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                 # Express backend API
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface
│   └── services/          # Business logic services
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── public/                 # Static assets and PWA files
└── uploads/               # File upload storage
```

## 🔐 Security Features

- **Role-Based Access Control**: Granular permissions for different user types
- **Session Management**: Secure session handling with automatic cleanup
- **Input Validation**: Comprehensive data validation using Zod schemas
- **File Upload Security**: Safe file handling with type validation
- **Environment-Based URLs**: Dynamic URL generation for different environments

## 🌐 Deployment

### Replit (Recommended)
1. Click the Deploy button in Replit
2. Configure environment variables in deployment settings
3. App available at `your-app-name.replit.app`

### Vercel
```bash
npm i -g vercel
vercel
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `PATCH /api/companies/:id` - Update company

### Visits
- `GET /api/visits` - List visits
- `POST /api/visits` - Create visit with GPS and photos
- `PATCH /api/visits/:id` - Update visit

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews/request` - Send review request
- `GET /api/reviews/stats` - Review analytics

### AI Content
- `POST /api/ai/generate-summary` - Generate visit summary
- `POST /api/ai/generate-blog-post` - Generate SEO blog post

## 🎯 Use Cases

### Home Service Businesses
- Plumbing companies
- HVAC contractors
- Electrical services
- Landscaping businesses
- Cleaning services
- Handyman services

### Key Benefits
- **Increase Reviews**: Automated review requests improve online reputation
- **Save Time**: AI-generated content reduces manual work
- **Track Technicians**: GPS logging ensures accountability
- **Professional Image**: WordPress integration enhances online presence
- **Mobile-First**: Optimized for technicians working in the field

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [deployment guide](DEPLOYMENT.md)
- Review the [PWA setup guide](PWA-SETUP.md)

## 🔄 Version History

### v1.0.0 (Current)
- Complete authentication system with real user registration
- GPS visit logging with photo uploads
- AI content generation with multiple providers
- WordPress and JavaScript embed integrations
- Progressive Web App with iOS/Android installation
- Production-ready deployment configuration

---

Built with ❤️ for home service businesses worldwide.