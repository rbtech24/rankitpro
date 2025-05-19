import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { 
  AlertCircle, 
  Save, 
  Edit, 
  Check, 
  X, 
  ChevronRight, 
  Code, 
  PlayCircle, 
  FileCode,
  Sliders,
  Link2
} from "lucide-react";

// Placeholder types
interface CustomField {
  key: string;
  name: string;
  type: string;
}

interface Template {
  file: string;
  name: string;
}

interface WordPressTemplates {
  customFieldTemplates?: Record<string, string>;
  defaultTitle?: string;
  defaultContent?: string;
  uploadPhotosToWP?: boolean;
  useAsFeaturedImage?: boolean;
  defaultTemplate?: string;
  defaultPostType?: string;
}

function WordPressCustomFieldsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("title-content");
  
  // WordPress credentials checking
  const { data: hasWordPressConfig, isLoading: checkingWp } = useQuery({
    queryKey: ['/api/integrations/wordpress/status'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integrations/wordpress/status");
      return res.json();
    },
    retry: false
  });
  
  // Available WordPress custom fields
  const { data: wpCustomFields, isLoading: fieldsLoading } = useQuery({
    queryKey: ['/api/wordpress-custom-fields/fields'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/wordpress-custom-fields/fields");
      return res.json() as Promise<CustomField[]>;
    },
    retry: false,
    enabled: !!hasWordPressConfig?.connected
  });
  
  // Available WordPress templates
  const { data: wpTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/wordpress-custom-fields/templates'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/wordpress-custom-fields/templates");
      return res.json() as Promise<Template[]>;
    },
    retry: false,
    enabled: !!hasWordPressConfig?.connected
  });
  
  // Current saved templates and mappings
  const { data: currentMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['/api/wordpress-custom-fields/mappings'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/wordpress-custom-fields/mappings");
      return res.json() as Promise<WordPressTemplates>;
    },
    retry: false,
    enabled: !!hasWordPressConfig?.connected
  });
  
  // Form state
  const [titleTemplate, setTitleTemplate] = useState("");
  const [contentTemplate, setContentTemplate] = useState("");
  const [uploadPhotos, setUploadPhotos] = useState(false);
  const [useFeaturedImage, setUseFeaturedImage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedPostType, setSelectedPostType] = useState("post");
  const [customFieldMappings, setCustomFieldMappings] = useState<Record<string, string>>({});
  
  // Set initial form values from API
  useEffect(() => {
    if (currentMappings) {
      setTitleTemplate(currentMappings.defaultTitle || "");
      setContentTemplate(currentMappings.defaultContent || "");
      setUploadPhotos(currentMappings.uploadPhotosToWP || false);
      setUseFeaturedImage(currentMappings.useAsFeaturedImage || false);
      setSelectedTemplate(currentMappings.defaultTemplate || "");
      setSelectedPostType(currentMappings.defaultPostType || "post");
      setCustomFieldMappings(currentMappings.customFieldTemplates || {});
    }
  }, [currentMappings]);
  
  // Save templates and mappings
  const saveTemplatesMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/wordpress-custom-fields/templates", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "WordPress custom field templates saved successfully",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wordpress-custom-fields/mappings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save WordPress custom field templates",
        variant: "destructive"
      });
    }
  });
  
  // Test publish with current templates and mappings
  const testPublishMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/wordpress-custom-fields/test-publish", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test successful",
        description: (
          <div>
            Post published as draft. <a 
              href={data.previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              View it
            </a>
          </div>
        ),
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: "Failed to test WordPress publishing",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveTemplates = () => {
    saveTemplatesMutation.mutate({
      templates: customFieldMappings,
      defaultTitle: titleTemplate,
      defaultContent: contentTemplate,
      uploadPhotosToWP: uploadPhotos,
      useAsFeaturedImage: useFeaturedImage,
      defaultTemplate: selectedTemplate,
      defaultPostType: selectedPostType
    });
  };
  
  const handleTestPublish = () => {
    testPublishMutation.mutate({
      titleTemplate,
      contentTemplate,
      uploadPhotos,
      useFeaturedImage,
      template: selectedTemplate,
      postType: selectedPostType,
      acfFields: customFieldMappings
    });
  };
  
  // Update custom field mapping
  const updateCustomFieldMapping = (key: string, value: string) => {
    setCustomFieldMappings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (checkingWp) {
    return <div className="container mx-auto py-8">Loading WordPress configuration...</div>;
  }
  
  if (!hasWordPressConfig?.connected) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>WordPress Custom Fields</CardTitle>
            <CardDescription>
              Advanced WordPress integration for your check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>WordPress Not Connected</AlertTitle>
              <AlertDescription>
                You need to configure WordPress integration first before you can use custom fields.
              </AlertDescription>
            </Alert>
            <Button variant="outline" asChild>
              <a href="/integrations">Go to Integrations Page</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>WordPress Custom Fields</CardTitle>
              <CardDescription>
                Advanced WordPress integration for your check-ins
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleTestPublish}
                disabled={testPublishMutation.isPending}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Test
              </Button>
              <Button 
                onClick={handleSaveTemplates}
                disabled={saveTemplatesMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="title-content">Title & Content</TabsTrigger>
              <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
              <TabsTrigger value="publishing-options">Publishing Options</TabsTrigger>
            </TabsList>
            
            {/* Title & Content Templates */}
            <TabsContent value="title-content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title-template">Title Template</Label>
                  <div className="mt-1">
                    <Input
                      id="title-template"
                      value={titleTemplate}
                      onChange={(e) => setTitleTemplate(e.target.value)}
                      placeholder="{job_type} Service at {location} - {date}"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available variables: {'{job_type}'}, {'{location}'}, {'{date}'}, {'{technician_name}'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="content-template">Content Template</Label>
                  <div className="mt-1">
                    <Textarea
                      id="content-template"
                      value={contentTemplate}
                      onChange={(e) => setContentTemplate(e.target.value)}
                      rows={10}
                      placeholder="<h2>Service Details</h2>
<p><strong>Service:</strong> {job_type}</p>
<p><strong>Location:</strong> {location}</p>
<p><strong>Date:</strong> {date}</p>
<p><strong>Technician:</strong> {technician_name}</p>

<h3>Work Performed</h3>
<p>{work_performed}</p>

<h3>Notes</h3>
<p>{notes}</p>"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available variables: {'{job_type}'}, {'{location}'}, {'{date}'}, {'{technician_name}'}, {'{notes}'},
                    {'{customer_name}'}, {'{work_performed}'}, {'{materials_used}'}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Custom Fields Mapping */}
            <TabsContent value="custom-fields" className="space-y-4">
              {fieldsLoading ? (
                <div className="py-4 text-center">Loading custom fields...</div>
              ) : wpCustomFields && wpCustomFields.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Map check-in data to your WordPress custom fields. Use the variable syntax
                    shown in the Content Template tab.
                  </p>
                  
                  {wpCustomFields.map((field) => (
                    <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Label>{field.name}</Label>
                        <p className="text-xs text-gray-500">Type: {field.type}</p>
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={customFieldMappings[field.key] || ''}
                          onChange={(e) => updateCustomFieldMapping(field.key, e.target.value)}
                          placeholder={`Value for ${field.name}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  No custom fields found. Make sure you have Advanced Custom Fields plugin installed on your WordPress site.
                </div>
              )}
            </TabsContent>
            
            {/* Publishing Options */}
            <TabsContent value="publishing-options" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="upload-photos">Upload Photos to WordPress</Label>
                    <p className="text-sm text-gray-500">
                      Uploads check-in photos to your WordPress media library
                    </p>
                  </div>
                  <Switch
                    id="upload-photos"
                    checked={uploadPhotos}
                    onCheckedChange={setUploadPhotos}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured-image">Use as Featured Image</Label>
                    <p className="text-sm text-gray-500">
                      Sets the first uploaded photo as the featured image
                    </p>
                  </div>
                  <Switch
                    id="featured-image"
                    checked={useFeaturedImage}
                    onCheckedChange={setUseFeaturedImage}
                    disabled={!uploadPhotos}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label htmlFor="template">WordPress Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Default Template</SelectItem>
                      {templatesLoading ? (
                        <SelectItem value="" disabled>Loading templates...</SelectItem>
                      ) : wpTemplates && wpTemplates.map((template) => (
                        <SelectItem key={template.file} value={template.file}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="post-type">Post Type</Label>
                  <Select
                    value={selectedPostType}
                    onValueChange={setSelectedPostType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="checkin">Check-in (Custom Post Type)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="/integrations">
              Back to Integrations
            </a>
          </Button>
          <Button 
            onClick={handleSaveTemplates}
            disabled={saveTemplatesMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default WordPressCustomFieldsPage;