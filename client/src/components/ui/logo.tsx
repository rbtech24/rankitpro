import React from "react";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textVisible?: boolean;
}

export function Logo({ className = "", size = 'md', textVisible = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  // SVG representation of the Rank it Pro logo (the square part)
  const svgLogo = (
    <div className="flex">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={`${sizeClasses[size]}`}>
        {/* Blue background square */}
        <rect width="100" height="100" rx="8" fill="#0088d2" />
        
        {/* White location marker */}
        <path 
          d="M50 12c-17 0-28 12-28 25C22 49 50 88 50 88s28-39 28-51c0-13-11-25-28-25z"
          fill="white"
        />
        
        {/* Green checkmark circle */}
        <circle cx="50" cy="37" r="18" fill="#00b05c" />
        <path 
          d="M40 37l7 7 13-13" 
          stroke="white" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Chart bars - positioned to match the image */}
        <rect x="60" y="65" width="7" height="20" fill="white" />
        <rect x="72" y="55" width="7" height="30" fill="white" />
        <rect x="84" y="70" width="7" height="15" fill="white" />
        
        {/* Chat bubble - more rectangular with pointer */}
        <rect x="69" y="15" width="23" height="16" rx="3" fill="white" />
        <path d="M75 31l-4 6h8z" fill="white" />
      </svg>
    </div>
  );

  // Text that shows "RANK IT PRO" or nothing if textVisible is false
  const logoText = textVisible && (
    <div className="ml-4">
      <div className="flex flex-col font-black tracking-wide leading-none">
        <span className={`${className.includes('footer') ? 'text-white' : 'text-[#2e3538]'} text-3xl`}>RANK</span>
        <span className={`${className.includes('footer') ? 'text-white' : 'text-[#2e3538]'} text-3xl`}>IT</span>
        <span className={`${className.includes('footer') ? 'text-white' : 'text-[#2e3538]'} text-3xl`}>PRO</span>
      </div>
    </div>
  );

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      {svgLogo}
      {logoText}
    </div>
  );
  
  return (
    <Link href="/">
      {logoContent}
    </Link>
  );
}