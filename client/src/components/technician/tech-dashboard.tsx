import React from "react";
import { Button } from "@/components/ui/button";
import RecentCheckIns from "@/components/dashboard/recent-visits";

interface TechDashboardProps {
  onNewVisit: () => void;
}

export default function TechDashboard({ onNewVisit }: TechDashboardProps) {
  return (
    <div className="technician-dashboard">
      {/* Mobile-optimized Technician Dashboard */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Field Technician</h2>
        <p className="text-sm text-gray-600">
          Log your service visits and track your work from the field
        </p>
      </div>
      
      {/* Large Create Visit Button for easy mobile access */}
      <div className="mb-6">
        <button 
          onClick={onNewVisit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center text-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Log New Visit
        </button>
      </div>
      
      {/* Recent Visits - Mobile Friendly Card List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Visits</h3>
        <div className="space-y-3">
          <RecentCheckIns showTechnicianView={true} limit={5} />
        </div>
      </div>
      
      {/* Quick Tips for Mobile */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <div className="mt-0.5 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span>Take photos of your work to better document the job</span>
          </li>
          <li className="flex items-start">
            <div className="mt-0.5 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span>Include specific details about materials and techniques used</span>
          </li>
          <li className="flex items-start">
            <div className="mt-0.5 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span>Enable location services for accurate job site recording</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
