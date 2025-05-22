import React from 'react';

export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <div className="flex items-center">
      <div className="h-10 w-10 bg-blue-500 rounded-md flex items-center justify-center mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
          <path d="m5 15 5-5"/>
          <path d="M19 8h.01"/>
        </svg>
      </div>
      <span className="font-bold text-lg text-gray-800">Rank It Pro</span>
    </div>
  );
}