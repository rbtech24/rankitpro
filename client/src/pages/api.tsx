import React, { useState } from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function API() {
  const [activeEndpoint, setActiveEndpoint] = useState(apiEndpoints[0].id);
  
  const selectedEndpoint = apiEndpoints.find(endpoint => endpoint.id === activeEndpoint) || apiEndpoints[0];
  
  return (
    <InfoPageLayout 
      title="API Documentation" 
      description="Integrate Rank It Pro with your existing systems"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <p className="mb-4">
            The Rank It Pro API allows you to integrate our platform with your existing systems. You can create check-ins, 
            manage technicians, generate content, and more through our RESTful API endpoints.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Authentication</h3>
          <p className="mb-4">
            All API requests require authentication using an API key. You can generate an API key in your 
            account settings. Include your API key in the header of each request:
          </p>
          
          <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto mb-6">
            <pre className="text-sm font-mono">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </pre>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Base URL</h3>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto mb-6">
            <pre className="text-sm font-mono">
              <code>https://api.rankitpro.com/v1</code>
            </pre>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Rate Limiting</h3>
          <p className="mb-4">
            The API is rate limited to 100 requests per minute per API key. If you exceed this limit, 
            you'll receive a 429 Too Many Requests response.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Sidebar - Endpoints */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Endpoints</h3>
              <ul className="space-y-1">
                {apiEndpoints.map((endpoint) => (
                  <li key={endpoint.id}>
                    <button
                      onClick={() => setActiveEndpoint(endpoint.id)}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeEndpoint === endpoint.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-mono">{endpoint.method}</span> {endpoint.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Content - Endpoint Details */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                  selectedEndpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                  selectedEndpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                  selectedEndpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                  selectedEndpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' : ''
                } mr-3`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-slate-700">{selectedEndpoint.path}</span>
              </div>
              
              <h2 className="text-xl font-bold mb-2">{selectedEndpoint.name}</h2>
              <p className="text-slate-600 mb-6">{selectedEndpoint.description}</p>
              
              {selectedEndpoint.parameters && (
                <>
                  <h3 className="text-lg font-semibold mt-8 mb-3">Parameters</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 border-b">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 border-b">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 border-b">Required</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 border-b">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEndpoint.parameters.map((param, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                            <td className="px-4 py-2 text-sm">{param.type}</td>
                            <td className="px-4 py-2 text-sm">{param.required ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-2 text-sm">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              
              <h3 className="text-lg font-semibold mt-8 mb-3">Example Request</h3>
              <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto mb-8">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  <code>{selectedEndpoint.exampleRequest}</code>
                </pre>
              </div>
              
              <h3 className="text-lg font-semibold mt-8 mb-3">Example Response</h3>
              <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  <code>{selectedEndpoint.exampleResponse}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Need Help with Integration?</h2>
          <p className="mb-6 max-w-2xl mx-auto text-slate-600">
            Our team is available to help you integrate CheckIn Pro with your existing systems. Contact us for custom integration support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#" className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              Contact Support
            </a>
            <a href="#" className="px-6 py-3 bg-white text-primary font-medium rounded-md border border-primary hover:bg-primary/5 transition-colors">
              View SDKs
            </a>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const apiEndpoints = [
  {
    id: 'check-ins-list',
    method: 'GET',
    path: '/check-ins',
    name: 'List Check-Ins',
    description: 'Retrieve a list of check-ins for your company. Results are paginated and can be filtered by various criteria.',
    parameters: [
      { name: 'page', type: 'integer', required: false, description: 'Page number for pagination (default: 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results per page (default: 20, max: 100)' },
      { name: 'technician_id', type: 'integer', required: false, description: 'Filter by technician ID' },
      { name: 'date_from', type: 'date', required: false, description: 'Filter by check-in date (format: YYYY-MM-DD)' },
      { name: 'date_to', type: 'date', required: false, description: 'Filter by check-in date (format: YYYY-MM-DD)' },
      { name: 'job_type', type: 'string', required: false, description: 'Filter by job type' }
    ],
    exampleRequest: `curl -X GET "https://api.rankitpro.com/v1/check-ins?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    exampleResponse: `{
  "data": [
    {
      "id": 123,
      "job_type": "Plumbing Repair",
      "technician_id": 45,
      "technician_name": "John Smith",
      "notes": "Fixed leaking sink in master bathroom",
      "latitude": "34.052235",
      "longitude": "-118.243683",
      "location": "Los Angeles, CA",
      "has_photos": true,
      "created_at": "2025-05-14T15:30:22Z"
    },
    // More check-ins...
  ],
  "pagination": {
    "total": 143,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}`
  },
  {
    id: 'check-in-create',
    method: 'POST',
    path: '/check-ins',
    name: 'Create Check-In',
    description: 'Create a new check-in record for a completed job.',
    parameters: [
      { name: 'job_type', type: 'string', required: true, description: 'Type of job/service performed' },
      { name: 'technician_id', type: 'integer', required: true, description: 'ID of the technician who performed the service' },
      { name: 'notes', type: 'string', required: true, description: 'Detailed notes about the service performed' },
      { name: 'latitude', type: 'string', required: false, description: 'Latitude coordinate of the job location' },
      { name: 'longitude', type: 'string', required: false, description: 'Longitude coordinate of the job location' },
      { name: 'location', type: 'string', required: false, description: 'Text description of the job location' },
      { name: 'photos', type: 'array', required: false, description: 'Array of base64-encoded images' }
    ],
    exampleRequest: `curl -X POST "https://api.rankitpro.com/v1/check-ins" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "job_type": "Water Heater Installation",
    "technician_id": 45,
    "notes": "Installed new 50-gallon water heater. Removed old unit and properly disposed.",
    "latitude": "34.052235",
    "longitude": "-118.243683",
    "location": "Los Angeles, CA",
    "photos": [
      {
        "name": "before.jpg",
        "content": "base64EncodedImageData..."
      },
      {
        "name": "after.jpg",
        "content": "base64EncodedImageData..."
      }
    ]
  }'`,
    exampleResponse: `{
  "id": 124,
  "job_type": "Water Heater Installation",
  "technician_id": 45,
  "technician_name": "John Smith",
  "notes": "Installed new 50-gallon water heater. Removed old unit and properly disposed.",
  "latitude": "34.052235",
  "longitude": "-118.243683",
  "location": "Los Angeles, CA",
  "has_photos": true,
  "created_at": "2025-05-15T10:42:18Z"
}`
  },
  {
    id: 'check-in-details',
    method: 'GET',
    path: '/check-ins/:id',
    name: 'Get Check-In Details',
    description: 'Retrieve detailed information about a specific check-in.',
    parameters: [
      { name: 'id', type: 'integer', required: true, description: 'The ID of the check-in to retrieve' }
    ],
    exampleRequest: `curl -X GET "https://api.rankitpro.com/v1/check-ins/123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    exampleResponse: `{
  "id": 123,
  "job_type": "Plumbing Repair",
  "technician_id": 45,
  "technician_name": "John Smith",
  "notes": "Fixed leaking sink in master bathroom. Replaced worn gasket and tightened connections.",
  "latitude": "34.052235",
  "longitude": "-118.243683",
  "location": "Los Angeles, CA",
  "photos": [
    {
      "id": 456,
      "url": "https://storage.rankitpro.com/photos/456.jpg",
      "thumbnail_url": "https://storage.rankitpro.com/photos/456_thumb.jpg",
      "created_at": "2025-05-14T15:30:22Z"
    },
    {
      "id": 457,
      "url": "https://storage.rankitpro.com/photos/457.jpg",
      "thumbnail_url": "https://storage.rankitpro.com/photos/457_thumb.jpg",
      "created_at": "2025-05-14T15:31:05Z"
    }
  ],
  "created_at": "2025-05-14T15:30:22Z",
  "has_blog_post": true,
  "blog_post_id": 89,
  "has_review_request": true,
  "review_request_id": 67
}`
  },
  {
    id: 'technicians-list',
    method: 'GET',
    path: '/technicians',
    name: 'List Technicians',
    description: 'Retrieve a list of technicians for your company.',
    parameters: [
      { name: 'page', type: 'integer', required: false, description: 'Page number for pagination (default: 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results per page (default: 20, max: 100)' }
    ],
    exampleRequest: `curl -X GET "https://api.rankitpro.com/v1/technicians" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    exampleResponse: `{
  "data": [
    {
      "id": 45,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "specialty": "Plumbing",
      "created_at": "2025-01-05T09:20:30Z"
    },
    // More technicians...
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}`
  },
  {
    id: 'blog-generate',
    method: 'POST',
    path: '/blog-posts/generate',
    name: 'Generate Blog Post',
    description: 'Generate a blog post from an existing check-in.',
    parameters: [
      { name: 'check_in_id', type: 'integer', required: true, description: 'ID of the check-in to use as the basis for the blog post' },
      { name: 'ai_provider', type: 'string', required: false, description: 'AI provider to use (openai, anthropic, xai). Default: openai' }
    ],
    exampleRequest: `curl -X POST "https://api.rankitpro.com/v1/blog-posts/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "check_in_id": 123,
    "ai_provider": "openai"
  }'`,
    exampleResponse: `{
  "id": 89,
  "title": "Common Causes of Sink Leaks and How to Fix Them",
  "content": "Sink leaks are one of the most common plumbing issues homeowners face...",
  "check_in_id": 123,
  "created_at": "2025-05-14T16:05:47Z",
  "photos": [
    {
      "id": 456,
      "url": "https://storage.rankitpro.com/photos/456.jpg",
      "thumbnail_url": "https://storage.rankitpro.com/photos/456_thumb.jpg"
    },
    {
      "id": 457,
      "url": "https://storage.rankitpro.com/photos/457.jpg",
      "thumbnail_url": "https://storage.rankitpro.com/photos/457_thumb.jpg"
    }
  ]
}`
  },
  {
    id: 'review-request-create',
    method: 'POST',
    path: '/review-requests',
    name: 'Create Review Request',
    description: 'Send a review request to a customer based on a completed check-in.',
    parameters: [
      { name: 'check_in_id', type: 'integer', required: true, description: 'ID of the check-in associated with this review request' },
      { name: 'customer_name', type: 'string', required: true, description: "Customer's name" },
      { name: 'method', type: 'string', required: true, description: 'Method to send the request: "email" or "sms"' },
      { name: 'email', type: 'string', required: false, description: "Customer's email (required if method is 'email')" },
      { name: 'phone', type: 'string', required: false, description: "Customer's phone number (required if method is 'sms')" }
    ],
    exampleRequest: `curl -X POST "https://api.rankitpro.com/v1/review-requests" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "check_in_id": 123,
    "customer_name": "Jane Doe",
    "method": "email",
    "email": "jane.doe@example.com"
  }'`,
    exampleResponse: `{
  "id": 67,
  "check_in_id": 123,
  "customer_name": "Jane Doe",
  "method": "email",
  "email": "jane.doe@example.com",
  "sent_at": "2025-05-14T16:30:12Z",
  "status": "sent",
  "review_url": "https://review.rankitpro.com/c/abc123def456"
}`
  }
];