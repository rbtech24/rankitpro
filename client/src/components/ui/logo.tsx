import React from 'react';

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  textVisible?: boolean;
  linkDisabled?: boolean;
}

export function Logo({ className, size = "sm", textVisible, linkDisabled }: LogoProps) {
  const height = size === "xs" ? "h-4" : size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-12";
  
  // Check if this is being used in footer context
  const isFooter = className?.includes('footer');
  const finalHeight = isFooter ? "h-4" : height; // Half the size for footer (h-8 -> h-4)
  
  return (
    <div className="flex items-center">
      <img src="/rank it pro logo.png" alt="RANK IT PRO" className={className || finalHeight} />
    </div>
  );
}