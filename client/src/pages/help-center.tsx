import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Link } from 'wouter';
import { Logo } from '../components/ui/logo';
import { 
  BookOpen, 
  Download, 
  Users, 
  MessageCircle, 
  Search, 
  FileText, 
  Smartphone, 
  Globe, 
  BarChart3, 
  Settings, 
  Shield,
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'guide' | 'video' | 'pdf' | 'tutorial';
  difficulty: 'Essential' | 'Required' | 'Tutorial' | 'Mobile' | 'Core Feature' | 'Best Practice' | 'Advanced' | 'Integration' | 'Customization' | 'Automation' | 'Marketing' | 'Analytics' | 'Management' | 'Business Intelligence' | 'Data Management' | 'Security' | 'Account' | 'Technical';
  icon: any;
  content?: string;
  downloadUrl?: string;
}

const helpItems: HelpItem[] = [
  // Getting Started
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    description: 'Learn the basics of Rank It Pro',
    category: 'Getting Started',
    type: 'guide',
    difficulty: 'Essential',
    icon: BookOpen,
    content: 'Complete introduction to all platform features and capabilities'
  },
  {
    id: 'account-setup',
    title: 'Account Setup',
    description: 'Configure your company profile',
    category: 'Getting Started',
    type: 'guide',
    difficulty: 'Essential',
    icon: Settings,
    content: 'Step-by-step guide to setting up your company account and preferences'
  },
  {
    id: 'adding-technicians',
    title: 'Adding Technicians',
    description: 'Manage your field team',
    category: 'Getting Started',
    type: 'tutorial',
    difficulty: 'Required',
    icon: Users,
    content: 'How to add, manage, and assign technicians to your company'
  },
  {
    id: 'first-checkin',
    title: 'First Check-in',
    description: 'Complete your first service visit',
    category: 'Getting Started',
    type: 'tutorial',
    difficulty: 'Tutorial',
    icon: CheckCircle,
    content: 'Walk through creating your first service check-in'
  },

  // Mobile App Guide
  {
    id: 'installing-pwa',
    title: 'Installing the PWA',
    description: 'Add to home screen instructions',
    category: 'Mobile App Guide',
    type: 'guide',
    difficulty: 'Mobile',
    icon: Smartphone,
    content: 'Install the Progressive Web App on iOS and Android devices'
  },
  {
    id: 'gps-checkins',
    title: 'GPS Check-ins',
    description: 'Location tracking and verification',
    category: 'Mobile App Guide',
    type: 'guide',
    difficulty: 'Core Feature',
    icon: CheckCircle,
    content: 'How GPS tracking works and manual override options'
  },
  {
    id: 'photo-documentation',
    title: 'Photo Documentation',
    description: 'Before/after photo guidelines',
    category: 'Mobile App Guide',
    type: 'guide',
    difficulty: 'Best Practice',
    icon: FileText,
    content: 'Best practices for documenting service visits with photos'
  },
  {
    id: 'offline-mode',
    title: 'Offline Mode',
    description: 'Working without internet connection',
    category: 'Mobile App Guide',
    type: 'guide',
    difficulty: 'Advanced',
    icon: Smartphone,
    content: 'How to use the app when offline and sync when connected'
  },

  // WordPress Integration
  {
    id: 'plugin-installation',
    title: 'Plugin Installation',
    description: 'Step-by-step setup guide',
    category: 'WordPress Integration',
    type: 'pdf',
    difficulty: 'Integration',
    icon: Globe,
    downloadUrl: '/api/help/download/wordpress-plugin-guide.pdf',
    content: 'Complete WordPress plugin installation and configuration guide'
  },
  {
    id: 'shortcode-usage',
    title: 'Shortcode Usage',
    description: 'Display check-ins on your site',
    category: 'WordPress Integration',
    type: 'guide',
    difficulty: 'Customization',
    icon: Globe,
    content: 'How to use shortcodes to display service visits on your WordPress site'
  },
  {
    id: 'auto-publishing',
    title: 'Auto-Publishing',
    description: 'Automatic content creation',
    category: 'WordPress Integration',
    type: 'guide',
    difficulty: 'Automation',
    icon: Globe,
    content: 'Set up automatic publishing of service visits to your website'
  },
  {
    id: 'seo-optimization',
    title: 'SEO Optimization',
    description: 'Local search improvements',
    category: 'WordPress Integration',
    type: 'guide',
    difficulty: 'Marketing',
    icon: BarChart3,
    content: 'Optimize your service content for local search results'
  },

  // Analytics & Reports
  {
    id: 'dashboard-metrics',
    title: 'Dashboard Metrics',
    description: 'Understanding your data',
    category: 'Analytics & Reports',
    type: 'guide',
    difficulty: 'Analytics',
    icon: BarChart3,
    content: 'How to read and interpret your dashboard analytics'
  },
  {
    id: 'performance-reports',
    title: 'Performance Reports',
    description: 'Track technician efficiency',
    category: 'Analytics & Reports',
    type: 'guide',
    difficulty: 'Management',
    icon: BarChart3,
    content: 'Generate and analyze technician performance reports'
  },
  {
    id: 'customer-insights',
    title: 'Customer Insights',
    description: 'Service area analysis',
    category: 'Analytics & Reports',
    type: 'guide',
    difficulty: 'Business Intelligence',
    icon: BarChart3,
    content: 'Analyze customer patterns and service area performance'
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Download reports and data',
    category: 'Analytics & Reports',
    type: 'guide',
    difficulty: 'Data Management',
    icon: Download,
    content: 'Export your data in various formats for external analysis'
  },

  // Review Management
  {
    id: 'automated-requests',
    title: 'Automated Requests',
    description: 'Set up review campaigns',
    category: 'Review Management',
    type: 'guide',
    difficulty: 'Automation',
    icon: Star,
    content: 'Configure automated review request campaigns'
  },
  {
    id: 'response-templates',
    title: 'Response Templates',
    description: 'Customize email messages',
    category: 'Review Management',
    type: 'guide',
    difficulty: 'Customization',
    icon: MessageCircle,
    content: 'Create and customize review request email templates'
  },
  {
    id: 'followup-sequences',
    title: 'Follow-up Sequences',
    description: 'Multi-stage review collection',
    category: 'Review Management',
    type: 'guide',
    difficulty: 'Advanced',
    icon: ArrowRight,
    content: 'Set up multi-stage follow-up sequences for better response rates'
  },
  {
    id: 'public-display',
    title: 'Public Display',
    description: 'Show reviews on your website',
    category: 'Review Management',
    type: 'guide',
    difficulty: 'Marketing',
    icon: Star,
    content: 'Display approved reviews on your company website'
  },

  // Account Management
  {
    id: 'user-permissions',
    title: 'User Permissions',
    description: 'Role-based access control',
    category: 'Account Management',
    type: 'guide',
    difficulty: 'Security',
    icon: Shield,
    content: 'Manage user roles and permissions for team members'
  },
  {
    id: 'billing-subscriptions',
    title: 'Billing & Subscriptions',
    description: 'Manage your plan',
    category: 'Account Management',
    type: 'guide',
    difficulty: 'Account',
    icon: Settings,
    content: 'Manage subscription plans, billing, and payment methods'
  },
  {
    id: 'api-access',
    title: 'API Access',
    description: 'Developer integration options',
    category: 'Account Management',
    type: 'guide',
    difficulty: 'Technical',
    icon: Settings,
    content: 'Access API documentation and integration guides'
  },
  {
    id: 'data-security',
    title: 'Data Security',
    description: 'Privacy and compliance',
    category: 'Account Management',
    type: 'guide',
    difficulty: 'Security',
    icon: Shield,
    content: 'Data security practices and compliance information'
  }
];

const categories = Array.from(new Set(helpItems.map(item => item.category)));

const difficultyColors = {
  'Essential': 'bg-green-100 text-green-800',
  'Required': 'bg-red-100 text-red-800',
  'Tutorial': 'bg-blue-100 text-blue-800',
  'Mobile': 'bg-purple-100 text-purple-800',
  'Core Feature': 'bg-orange-100 text-orange-800',
  'Best Practice': 'bg-teal-100 text-teal-800',
  'Advanced': 'bg-gray-100 text-gray-800',
  'Integration': 'bg-indigo-100 text-indigo-800',
  'Customization': 'bg-pink-100 text-pink-800',
  'Automation': 'bg-yellow-100 text-yellow-800',
  'Marketing': 'bg-emerald-100 text-emerald-800',
  'Analytics': 'bg-cyan-100 text-cyan-800',
  'Management': 'bg-violet-100 text-violet-800',
  'Business Intelligence': 'bg-rose-100 text-rose-800',
  'Data Management': 'bg-amber-100 text-amber-800',
  'Security': 'bg-red-100 text-red-800',
  'Account': 'bg-slate-100 text-slate-800',
  'Technical': 'bg-stone-100 text-stone-800'
};

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null);

  const filteredItems = helpItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (downloadUrl: string, title: string) => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link to="/help-center" className="text-gray-900 font-medium">Help Center</Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Everything you need to master Rank It Pro
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
            <TabsTrigger value="getting-started" onClick={() => setSelectedCategory('Getting Started')}>Getting Started</TabsTrigger>
            <TabsTrigger value="mobile" onClick={() => setSelectedCategory('Mobile App Guide')}>Mobile</TabsTrigger>
            <TabsTrigger value="wordpress" onClick={() => setSelectedCategory('WordPress Integration')}>WordPress</TabsTrigger>
            <TabsTrigger value="analytics" onClick={() => setSelectedCategory('Analytics & Reports')}>Analytics</TabsTrigger>
            <TabsTrigger value="account" onClick={() => setSelectedCategory('Account Management')}>Account</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <item.icon className="h-6 w-6 text-blue-600" />
                      <Badge className={difficultyColors[item.difficulty]}>
                        {item.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{item.category}</Badge>
                      <div className="flex items-center space-x-2">
                        {item.type === 'pdf' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.downloadUrl) {
                                handleDownload(item.downloadUrl, item.title);
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        {item.type === 'video' && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Video
                          </Button>
                        )}
                        <Button size="sm">
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tab contents would follow the same pattern */}
        </Tabs>

        {/* Selected Item Modal/Detail View */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <selectedItem.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{selectedItem.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <Badge className={difficultyColors[selectedItem.difficulty]}>
                    {selectedItem.difficulty}
                  </Badge>
                  <Badge variant="outline">{selectedItem.category}</Badge>
                  <Badge variant="outline">{selectedItem.type}</Badge>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg">{selectedItem.content}</p>
                  
                  {selectedItem.type === 'pdf' && selectedItem.downloadUrl && (
                    <div className="mt-6">
                      <Button onClick={() => handleDownload(selectedItem.downloadUrl!, selectedItem.title)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Guide
                      </Button>
                    </div>
                  )}

                  {/* Placeholder for detailed content */}
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">What you'll learn:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        Step-by-step instructions
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        Best practices and tips
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        Common troubleshooting solutions
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        Real-world examples
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" />
              <p className="text-gray-400 mt-4">
                The complete home service business management platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help-center" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/documentation" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/status" className="hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Rank It Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}