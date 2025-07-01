import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "queryClient";
import Sidebar from '../components/layout/sidebar-clean';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "ui/tabs";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Badge } from "ui/badge";
import { 
  Code, 
  ExternalLink, 
  Copy, 
  Star, 
  MapPin, 
  User, 
  Calendar,
  FileText,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useToast } from "use-toast";

export default function ShortcodeDemo() {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Fetch companies for dropdown
  const { data: companies } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/companies');
      return res.json();
    }
  });

  // Fetch data for selected company
  const { data: checkIns } = useQuery({
    queryKey: [`/api/companies/${selectedCompany?.id}/check-ins`],
    enabled: !!selectedCompany,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/companies/${selectedCompany.id}/check-ins`);
      return res.json();
    }
  });

  const { data: blogs } = useQuery({
    queryKey: [`/api/companies/${selectedCompany?.id}/blog-posts`],
    enabled: !!selectedCompany,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/companies/${selectedCompany.id}/blog-posts`);
      return res.json();
    }
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/companies/${selectedCompany?.id}/reviews`],
    enabled: !!selectedCompany,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/companies/${selectedCompany.id}/reviews`);
      return res.json();
    }
  });

  const { data: technicians } = useQuery({
    queryKey: [`/api/companies/${selectedCompany?.id}/technicians`],
    enabled: !!selectedCompany,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/companies/${selectedCompany.id}/technicians`);
      return res.json();
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Shortcode copied to clipboard",
    });
  };

  const shortcodes = [
    {
      code: `[rankitpro_checkins company_id="${selectedCompany?.id || 'YOUR_COMPANY_ID'}" limit="5"]`,
      title: "Recent Check-ins",
      description: "Display latest technician visits and service calls"
    },
    {
      code: `[rankitpro_blogs company_id="${selectedCompany?.id || 'YOUR_COMPANY_ID'}" limit="3"]`,
      title: "Service Blog Posts",
      description: "Show AI-generated blog content from job visits"
    },
    {
      code: `[rankitpro_reviews company_id="${selectedCompany?.id || 'YOUR_COMPANY_ID'}" limit="5"]`,
      title: "Customer Reviews",
      description: "Display customer testimonials and ratings"
    },
    {
      code: `[rankitpro_technicians company_id="${selectedCompany?.id || 'YOUR_COMPANY_ID'}"]`,
      title: "Team Members",
      description: "Show your service technician profiles"
    },
    {
      code: `[rankitpro_showcase company_id="${selectedCompany?.id || 'YOUR_COMPANY_ID'}" type="grid"]`,
      title: "Service Showcase",
      description: "Combined display of services, reviews, and team"
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WordPress Shortcode Demo</h1>
            <p className="text-muted-foreground">
              Test how your shortcodes will display real data on any WordPress site
            </p>
          </div>

          {/* Company Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Company to Test</CardTitle>
              <CardDescription>
                Choose a company to see how their data appears through shortcodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companies?.map((company: any) => (
                  <Card 
                    key={company.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedCompany?.id === company.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {company.id} • Plan: {company.plan || 'Starter'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCompany && (
            <Tabs defaultValue="shortcodes" className="space-y-6">
              <TabsList>
                <TabsTrigger value="shortcodes">Available Shortcodes</TabsTrigger>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
                <TabsTrigger value="integration">Integration Guide</TabsTrigger>
              </TabsList>

              <TabsContent value="shortcodes" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {shortcodes.map((shortcode, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {shortcode.title}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(shortcode.code)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </CardTitle>
                        <CardDescription>{shortcode.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                          {shortcode.code}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                {/* Check-ins Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Recent Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checkIns?.slice(0, 5).map((checkIn: any) => (
                        <div key={checkIn.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="font-medium">{checkIn.jobType}</div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {checkIn.location}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(checkIn.createdAt).toLocaleDateString()}
                          </div>
                          {checkIn.notes && (
                            <div className="text-sm mt-2 text-gray-700">{checkIn.notes}</div>
                          )}
                        </div>
                      )) || <div className="text-gray-500">No check-ins available</div>}
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Posts Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Service Blog Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blogs?.slice(0, 3).map((blog: any) => (
                        <div key={blog.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                          <div className="text-gray-600 mb-3 line-clamp-3">
                            {blog.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )) || <div className="text-gray-500">No blog posts available</div>}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Customer Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews?.slice(0, 5).map((review: any) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">{review.customerName || 'Anonymous'}</span>
                          </div>
                          <div className="text-gray-600">{review.comment || review.feedback}</div>
                        </div>
                      )) || <div className="text-gray-500">No reviews available</div>}
                    </div>
                  </CardContent>
                </Card>

                {/* Technicians Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {technicians?.map((tech: any) => (
                        <div key={tech.id} className="text-center p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                            {tech.name?.charAt(0) || 'T'}
                          </div>
                          <div className="font-medium">{tech.name}</div>
                          <div className="text-sm text-gray-500">{tech.email}</div>
                          <Badge variant="secondary" className="mt-2">
                            Active
                          </Badge>
                        </div>
                      )) || <div className="text-gray-500">No technicians available</div>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>WordPress Integration Instructions</CardTitle>
                    <CardDescription>
                      Follow these steps to add shortcodes to any WordPress site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h3 className="font-medium">Install the Plugin</h3>
                          <p className="text-sm text-gray-600">Download and install the Rank It Pro WordPress plugin from your admin dashboard</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h3 className="font-medium">Configure API Settings</h3>
                          <p className="text-sm text-gray-600">Enter your company ID and API credentials in the plugin settings</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h3 className="font-medium">Add Shortcodes</h3>
                          <p className="text-sm text-gray-600">Copy any shortcode above and paste it into your WordPress posts, pages, or widgets</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h3 className="font-medium">Customize Appearance</h3>
                          <p className="text-sm text-gray-600">Use CSS classes and attributes to match your site's design</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Non-WordPress Sites</h4>
                      <p className="text-sm text-yellow-700">
                        For non-WordPress sites, use our JavaScript widget or REST API endpoints to display the same data.
                        Contact support for integration assistance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {!selectedCompany && (
            <Card>
              <CardContent className="text-center py-12">
                <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Company to Begin</h3>
                <p className="text-gray-600">
                  Choose a company above to see how their real data will appear through WordPress shortcodes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}