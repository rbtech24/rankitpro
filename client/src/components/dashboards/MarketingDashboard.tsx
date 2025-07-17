import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Star, 
  MessageSquare, 
  Share2, 
  Bot,
  TrendingUp,
  Plus,
  Globe,
  Users,
  ThumbsUp,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MarketingDashboardProps {
  company: {
    id: number;
    name: string;
    businessType: string;
  };
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export function MarketingDashboard({ company, user }: MarketingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'testimonials' | 'content'>('overview');

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/marketing', company.id],
    enabled: !!company.id
  });

  const { data: recentReviews } = useQuery({
    queryKey: ['/api/reviews', company.id, { limit: 5 }],
    enabled: !!company.id
  });

  const { data: testimonials } = useQuery({
    queryKey: ['/api/testimonials', company.id],
    enabled: !!company.id
  });

  const { data: blogPosts } = useQuery({
    queryKey: ['/api/blog-posts', company.id],
    enabled: !!company.id
  });

  const quickActions = [
    { 
      icon: <Star className="w-4 h-4" />, 
      label: 'Request Reviews', 
      action: () => window.location.href = '/admin/reviews',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    { 
      icon: <Bot className="w-4 h-4" />, 
      label: 'Generate Content', 
      action: () => window.location.href = '/admin/generate-content',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      icon: <MessageSquare className="w-4 h-4" />, 
      label: 'Collect Testimonials', 
      action: () => window.location.href = '/admin/testimonials',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      icon: <Share2 className="w-4 h-4" />, 
      label: 'Social Media', 
      action: () => window.location.href = '/admin/social-media',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const overviewCards = [
    {
      title: 'Google Reviews',
      value: stats?.totalReviews || 0,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      description: 'Total reviews received',
      trend: '+5 this week'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating || '0.0',
      icon: <ThumbsUp className="w-5 h-5 text-green-500" />,
      description: 'Overall rating score',
      trend: '↑ 0.2 improvement'
    },
    {
      title: 'AI Content Posts',
      value: stats?.contentPosts || 0,
      icon: <Bot className="w-5 h-5 text-blue-500" />,
      description: 'Blog posts generated',
      trend: '+12 this month'
    },
    {
      title: 'Social Reach',
      value: stats?.socialReach || '0',
      icon: <Share2 className="w-5 h-5 text-purple-500" />,
      description: 'Social media impressions',
      trend: '+1.2K this week'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600">Marketing & Reputation Management Dashboard</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Marketing Edition
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.action}
            className={`${action.color} text-white h-auto py-3 px-4 flex flex-col items-center gap-2`}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'testimonials', label: 'Testimonials' },
          { id: 'content', label: 'Content' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-gray-600">{card.description}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{card.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Recent Reviews
              </CardTitle>
              <CardDescription>Latest customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews?.slice(0, 5).map((review: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{review.customerName}</p>
                      <p className="text-xs text-gray-600 mt-1">{review.reviewText?.slice(0, 120)}...</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet</p>
                    <Button className="mt-2" onClick={() => window.location.href = '/admin/reviews'}>
                      Request First Review
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Content Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Content Engine
              </CardTitle>
              <CardDescription>Boost your online presence with automated content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Blog Posts Generated</span>
                    <Badge variant="secondary">{stats?.contentPosts || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SEO Rankings</span>
                    <Badge variant="default" className="bg-green-500">Improving</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">WordPress Posts</span>
                    <Badge variant="secondary">{stats?.wordpressPosts || 0}</Badge>
                  </div>
                </div>
                <div className="text-center">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={() => window.location.href = '/admin/generate-content'}>
                    <Bot className="w-4 h-4 mr-2" />
                    Generate New Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reviews' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Review Management
            </CardTitle>
            <CardDescription>Monitor and manage customer reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews?.map((review: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="font-medium">{review.customerName}</p>
                      <p className="text-sm text-gray-600 mt-1">{review.reviewText}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Respond</Button>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                  <Button className="mt-2" onClick={() => window.location.href = '/admin/reviews'}>
                    Start Review Campaign
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'testimonials' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Customer Testimonials
            </CardTitle>
            <CardDescription>Showcase positive customer experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testimonials?.map((testimonial: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm italic">"{testimonial.content}"</p>
                      <p className="text-sm font-medium mt-2">- {testimonial.customerName}</p>
                      <p className="text-xs text-gray-500">{testimonial.customerTitle}</p>
                    </div>
                    <Badge variant={testimonial.isApproved ? "default" : "secondary"}>
                      {testimonial.isApproved ? "Published" : "Pending"}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500">No testimonials yet</p>
                  <Button className="mt-2" onClick={() => window.location.href = '/admin/testimonials'}>
                    Collect Testimonials
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Content Library
            </CardTitle>
            <CardDescription>AI-generated blog posts and marketing content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogPosts?.map((post: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-gray-600">{post.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Published {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">AI Generated</Badge>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500">No content generated yet</p>
                  <Button className="mt-2" onClick={() => window.location.href = '/admin/generate-content'}>
                    Generate First Post
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}