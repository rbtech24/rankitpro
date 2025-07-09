import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MapPin, 
  Camera, 
  Star, 
  MessageSquare, 
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Target,
  BarChart3,
  Smartphone,
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UniversalDashboardProps {
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
  businessType: 'service_business' | 'non_service_business';
}

export function UniversalDashboard({ company, user, businessType }: UniversalDashboardProps) {
  const isServiceBusiness = businessType === 'service_business';
  
  // Determine available tabs based on business type
  const availableTabs = isServiceBusiness 
    ? ['overview', 'checkins', 'reviews', 'content', 'team']
    : ['overview', 'reviews', 'content', 'team'];
  
  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]);

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/universal', company.id],
    enabled: !!company.id
  });

  const { data: recentCheckins } = useQuery({
    queryKey: ['/api/check-ins', company.id, { limit: 5 }],
    enabled: !!company.id && isServiceBusiness
  });

  const { data: recentReviews } = useQuery({
    queryKey: ['/api/reviews', company.id, { limit: 5 }],
    enabled: !!company.id
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-members', company.id],
    enabled: !!company.id
  });

  const { data: blogPosts } = useQuery({
    queryKey: ['/api/blog-posts', company.id],
    enabled: !!company.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name} Dashboard</h1>
          <p className="text-gray-600">
            {isServiceBusiness ? 'Service Business - All Features Available' : 'Non-Service Business - All Features Except Check-ins'}
          </p>
        </div>
        <Badge variant={isServiceBusiness ? "default" : "secondary"}>
          {isServiceBusiness ? 'Service Business' : 'Non-Service Business'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.reviewsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Content Generated</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.contentThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        {isServiceBusiness && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
              <MapPin className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCheckins || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.checkinsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTeamMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeTeamMembers || 0} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isServiceBusiness && (
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          )}
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReviews?.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{review.customerName}</p>
                        <p className="text-xs text-gray-600">{review.rating}/5 stars</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Available Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Review Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI Content Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Social Media Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Team Management</span>
                  </div>
                  {isServiceBusiness ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">GPS Check-ins & Job Tracking</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Check-ins (Service businesses only)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isServiceBusiness && (
          <TabsContent value="checkins" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Check-ins</h3>
              <Button>View All Check-ins</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCheckins?.map((checkin: any) => (
                <Card key={checkin.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{checkin.customerName}</CardTitle>
                      <Badge variant="outline">{checkin.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-2">{checkin.serviceType}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {checkin.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            <Button>Manage Reviews</Button>
          </div>
          <div className="space-y-4">
            {recentReviews?.map((review: any) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{review.customerName}</CardTitle>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Generated Content</h3>
            <Button>Generate New Content</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPosts?.map((post: any) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <Button>Add Team Member</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers?.map((member: any) => (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{member.name}</CardTitle>
                    <Badge variant={member.active ? "default" : "secondary"}>
                      {member.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">{member.role}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}