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

  // SVG representation of the Rank it Pro logo
  const svgLogo = (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={`${sizeClasses[size]}`}>
      {/* Blue background square */}
      <rect width="100" height="100" rx="8" fill="#0088d2" />
      
      {/* White location marker */}
      <path 
        d="M50 20c-12 0-20 8-20 18C30 48 50 80 50 80s20-32 20-42c0-10-8-18-20-18z"
        fill="white"
      />
      
      {/* Green checkmark circle */}
      <circle cx="50" cy="40" r="15" fill="#00b05c" />
      <path 
        d="M43 40l5 5 10-10" 
        stroke="white" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Chart bars */}
      <rect x="60" y="60" width="5" height="20" fill="white" />
      <rect x="70" y="50" width="5" height="30" fill="white" />
      <rect x="80" y="65" width="5" height="15" fill="white" />
      
      {/* Chat bubble */}
      <rect x="75" y="20" width="15" height="15" rx="2" fill="white" />
      <path d="M78 25h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2z" fill="#0088d2" />
    </svg>
  );

  // Text that shows "RANK IT PRO" or nothing if textVisible is false
  const logoText = textVisible && (
    <div className="font-bold text-[#2e3538] ml-2">
      <span className="font-black text-2xl">RANK IT PRO</span>
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