import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Book, Code, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DocsTest() {
  const documentationRoutes = [
    { path: "/documentation", name: "Main Documentation", description: "Complete platform guide" },
    { path: "/api-documentation", name: "API Documentation", description: "REST API reference" },
    { path: "/installation-guide", name: "Installation Guide", description: "Setup instructions" },
    { path: "/troubleshooting", name: "Troubleshooting", description: "Common issues and solutions" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation System Test</h1>
          <p className="text-gray-500">
            Test all documentation routes and verify they are working correctly
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Documentation Routes Status
            </CardTitle>
            <CardDescription>
              Click any route below to test documentation navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentationRoutes.map((route) => (
                <Card key={route.path} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{route.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{route.description}</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                          {route.path}
                        </code>
                      </div>
                      <Link href={route.path}>
                        <Button size="sm" className="ml-2">
                          Test
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-blue-500" />
                User Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/documentation">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    Getting Started Guide
                  </div>
                </Link>
                <Link href="/installation-guide">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    Installation Steps
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Developer Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/api-documentation">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    API Reference
                  </div>
                </Link>
                <Link href="/api-credentials">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    API Credentials
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-500" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/troubleshooting">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    Troubleshooting
                  </div>
                </Link>
                <Link href="/support">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    Contact Support
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Authentication</div>
                <Badge variant="outline" className="mt-1">Active</Badge>
              </div>
              <div>
                <div className="font-medium">User Role</div>
                <Badge variant="outline" className="mt-1">Super Admin</Badge>
              </div>
              <div>
                <div className="font-medium">Documentation Status</div>
                <Badge variant="outline" className="mt-1">Available</Badge>
              </div>
              <div>
                <div className="font-medium">Last Updated</div>
                <Badge variant="outline" className="mt-1">June 30, 2025</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}