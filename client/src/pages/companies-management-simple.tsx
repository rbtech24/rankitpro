import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompaniesManagement() {
  // Fetch real companies data
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch real subscription plans
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['/api/subscription-plans'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (companiesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies Management</h1>
          <p className="text-muted-foreground">
            Manage companies, subscription plans, and billing
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(companies as any[]).length}</div>
            <p className="text-xs text-muted-foreground">
              Active companies in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(subscriptionPlans as any[]).length}</div>
            <p className="text-xs text-muted-foreground">
              Available subscription tiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(companies as any[]).reduce((sum: number, company: any) => sum + (company.technicians || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total technicians across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(companies as any[]).reduce((sum: number, company: any) => sum + (company.monthlyRevenue || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total monthly recurring revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies Overview</CardTitle>
          <CardDescription>
            A list of all companies using your platform with authentic data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(companies as any[]).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No companies found. Data is loading from the database...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(companies as any[]).map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{company.planName || 'No Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.technicians || 0} technicians
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}