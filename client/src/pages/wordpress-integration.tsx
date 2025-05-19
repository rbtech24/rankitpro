import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight,
  Check,
  Download,
  Globe,
  Loader2,
  Settings,
  Code,
  Copy,
  ExternalLink
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { apiRequest } from "@/lib/queryClient";

// Define WordPress configuration types
interface WordPressCredentials {
  siteUrl: string;
  username: string;
  password: string;
  categories?: number[];
  tags?: number[];
}

interface WordPressConfig {
  credentials: WordPressCredentials;
  autoPublish: boolean;
  autoPublishBlogPosts: boolean;
  autoPublishCheckIns: boolean;
  apiKey?: string;
}

export default function WordPressIntegration() {
  const { toast } = useToast();
  
  // WordPress configuration state
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<WordPressConfig>({
    credentials: {
      siteUrl: '',
      username: '',
      password: ''
    },
    autoPublish: false,
    autoPublishBlogPosts: false,
    autoPublishCheckIns: false
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Fetch WordPress configuration on component mount
  useEffect(() => {
    fetchWordPressConfig();
    fetchEmbedCode();
  }, []);
  
  // Function to fetch WordPress configuration
  const fetchWordPressConfig = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('GET', '/api/wordpress/config');
      const data = await response.json();
      
      if (data.configured) {
        setIsConfigured(true);
        setConfig(data.config);
      } else {
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('Error fetching WordPress configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WordPress configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch JavaScript embed code
  const fetchEmbedCode = async () => {
    try {
      const response = await apiRequest('GET', '/api/wordpress/embed');
      const data = await response.json();
      
      if (data.embedCode) {
        setEmbedCode(data.embedCode);
      }
    } catch (error) {
      console.error('Error fetching embed code:', error);
    }
  };
  
  // Function to save WordPress configuration
  const saveWordPressConfig = async () => {
    setIsSaving(true);
    
    try {
      // Validate inputs
      if (!config.credentials.siteUrl || !config.credentials.username || !config.credentials.password) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      // Clean up the site URL if needed
      if (!config.credentials.siteUrl.startsWith('http')) {
        setConfig({
          ...config,
          credentials: {
            ...config.credentials,
            siteUrl: `https://${config.credentials.siteUrl}`
          }
        });
      }
      
      // Save the configuration
      const response = await apiRequest('POST', '/api/wordpress/config', config);
      
      if (response.ok) {
        setIsConfigured(true);
        toast({
          title: 'Success',
          description: 'WordPress configuration saved successfully'
        });
        
        // Refresh embed code after saving
        fetchEmbedCode();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to save WordPress configuration',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving WordPress configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save WordPress configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to test WordPress connection
  const testWordPressConnection = async () => {
    setIsTesting(true);
    
    try {
      // Validate inputs
      if (!config.credentials.siteUrl || !config.credentials.username || !config.credentials.password) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsTesting(false);
        return;
      }
      
      // Create a temporary service with the current credentials
      const testConfig = {
        ...config
      };
      
      // Test the connection
      const response = await apiRequest('POST', '/api/wordpress/config', testConfig);
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'WordPress connection successful'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Connection Failed',
          description: errorData.error || 'Failed to connect to WordPress',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing WordPress connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to test WordPress connection',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Function to download WordPress plugin
  const downloadWordPressPlugin = () => {
    try {
      // Create a link to download the plugin
      window.location.href = '/api/wordpress/plugin';
      
      toast({
        title: 'Download Started',
        description: 'Your WordPress plugin download has started'
      });
    } catch (error) {
      console.error('Error downloading WordPress plugin:', error);
      toast({
        title: 'Error',
        description: 'Failed to download WordPress plugin',
        variant: 'destructive'
      });
    }
  };
  
  // Function to copy embed code to clipboard
  const copyEmbedCode = () => {
    try {
      navigator.clipboard.writeText(embedCode);
      
      toast({
        title: 'Copied',
        description: 'Embed code copied to clipboard'
      });
    } catch (error) {
      console.error('Error copying embed code:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy embed code',
        variant: 'destructive'
      });
    }
  };
  
  // Function to reset WordPress configuration
  const resetWordPressConfig = () => {
    setConfig({
      credentials: {
        siteUrl: '',
        username: '',
        password: ''
      },
      autoPublish: false,
      autoPublishBlogPosts: false,
      autoPublishCheckIns: false
    });
    
    setIsConfigured(false);
    setShowResetDialog(false);
    
    toast({
      title: 'Reset',
      description: 'WordPress configuration has been reset'
    });
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">WordPress Integration</h1>
        <p className="text-muted-foreground mb-6">
          Connect your WordPress website to automatically publish check-ins and blog posts
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="setup">
            <TabsList className="mb-6">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="plugin">WordPress Plugin</TabsTrigger>
              <TabsTrigger value="embed">JavaScript Embed</TabsTrigger>
            </TabsList>
            
            {/* Setup Tab */}
            <TabsContent value="setup">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-6 w-6 mr-2" />
                      WordPress Connection
                    </CardTitle>
                    <CardDescription>
                      Connect to your WordPress website to enable automatic publishing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="site-url">WordPress Site URL</Label>
                      <Input
                        id="site-url"
                        placeholder="https://example.com"
                        value={config.credentials.siteUrl}
                        onChange={(e) => setConfig({
                          ...config,
                          credentials: {
                            ...config.credentials,
                            siteUrl: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The URL of your WordPress website
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="username">WordPress Username</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        value={config.credentials.username}
                        onChange={(e) => setConfig({
                          ...config,
                          credentials: {
                            ...config.credentials,
                            username: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The username of a WordPress administrator account
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Application Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••••••"
                        value={config.credentials.password}
                        onChange={(e) => setConfig({
                          ...config,
                          credentials: {
                            ...config.credentials,
                            password: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        <a 
                          href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          WordPress Application Password
                        </a> 
                        {' '}- not your regular login password
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Automatic Publishing Options</h3>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="auto-publish"
                          checked={config.autoPublish}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            autoPublish: checked === true
                          })}
                        />
                        <Label htmlFor="auto-publish">Enable automatic publishing</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-6">
                        <Checkbox
                          id="auto-publish-check-ins"
                          checked={config.autoPublishCheckIns}
                          disabled={!config.autoPublish}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            autoPublishCheckIns: checked === true
                          })}
                        />
                        <Label 
                          htmlFor="auto-publish-check-ins"
                          className={!config.autoPublish ? "text-muted-foreground" : ""}
                        >
                          Publish check-ins automatically
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-6">
                        <Checkbox
                          id="auto-publish-blog-posts"
                          checked={config.autoPublishBlogPosts}
                          disabled={!config.autoPublish}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            autoPublishBlogPosts: checked === true
                          })}
                        />
                        <Label 
                          htmlFor="auto-publish-blog-posts"
                          className={!config.autoPublish ? "text-muted-foreground" : ""}
                        >
                          Publish AI-generated blog posts automatically
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setShowResetDialog(true)}
                    >
                      Reset
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={testWordPressConnection}
                        disabled={isTesting || isSaving}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>Test Connection</>
                        )}
                      </Button>
                      <Button
                        onClick={saveWordPressConfig}
                        disabled={isSaving || isTesting}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>Save Configuration</>
                        )}
                      </Button>
                      {isConfigured && (
                        <Button variant="secondary" onClick={() => window.location.href = "/wordpress-custom-fields"}>
                          Advanced Custom Fields
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* WordPress Plugin Tab */}
            <TabsContent value="plugin">
              <Card>
                <CardHeader>
                  <CardTitle>WordPress Plugin</CardTitle>
                  <CardDescription>
                    Install our WordPress plugin to display your check-ins on your WordPress website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Plugin Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Display check-ins using shortcodes like <code>[check_ins limit="5"]</code></span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Sidebar widget for showing recent check-ins</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Automatic styling that matches your WordPress theme</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Settings page for easy configuration</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Installation Instructions</h3>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="pl-2">
                        Download the plugin file using the button below
                      </li>
                      <li className="pl-2">
                        Log in to your WordPress admin panel
                      </li>
                      <li className="pl-2">
                        Go to Plugins &gt; Add New &gt; Upload Plugin
                      </li>
                      <li className="pl-2">
                        Choose the downloaded file and click "Install Now"
                      </li>
                      <li className="pl-2">
                        After installation, click "Activate Plugin"
                      </li>
                      <li className="pl-2">
                        Configure the plugin by going to Settings &gt; Check-In Settings
                      </li>
                    </ol>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={downloadWordPressPlugin}
                    disabled={!isConfigured}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isConfigured ? "Download WordPress Plugin" : "Configure WordPress First"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* JavaScript Embed Tab */}
            <TabsContent value="embed">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Embed Code</CardTitle>
                  <CardDescription>
                    Use this code to embed your check-ins on any website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Embed Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Works on any website platform (not just WordPress)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Simple installation using a single HTML code snippet</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Automatic styling included</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                        <span>Customize the number of check-ins to display</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Embed Code</h3>
                    <div className="relative">
                      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-md overflow-auto text-sm">
                        {embedCode || 'Configure WordPress connection to generate embed code'}
                      </pre>
                      {embedCode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyEmbedCode}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Installation Instructions</h3>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="pl-2">
                        Copy the embed code above
                      </li>
                      <li className="pl-2">
                        Paste it into any HTML page where you want to display your check-ins
                      </li>
                      <li className="pl-2">
                        You can customize the number of check-ins by changing the <code>data-limit</code> attribute
                      </li>
                    </ol>
                  </div>
                </CardContent>
                <CardFooter className="block space-y-4">
                  <Button 
                    onClick={copyEmbedCode}
                    disabled={!embedCode}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </Button>
                  
                  {!isConfigured && (
                    <p className="text-sm text-amber-500 flex items-center">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure WordPress connection in the Setup tab to generate your embed code
                    </p>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Reset Configuration Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset WordPress Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your WordPress settings. You will need to configure it again to use WordPress integration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetWordPressConfig}>
              Reset Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}