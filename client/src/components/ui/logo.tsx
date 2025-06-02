import React from 'react';

export function Logo({ className = "h-10", size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const height = size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-12";
  
  return (
    <div className="flex items-center">
      <img src="/rank it pro logo.png" alt="RANK IT PRO" className={className || height} />
    </div>
  );
}