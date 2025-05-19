import React from "react";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textVisible?: boolean;
}

export function Logo({ className = "", size = 'md', textVisible = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG Logo based on the provided image */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Blue background square with rounded corners */}
          <rect width="100" height="100" rx="8" fill="#0088d2" />
          
          {/* White location pin */}
          <path 
            d="M50 20c-11 0-20 9-20 20 0 11 20 40 20 40s20-29 20-40c0-11-9-20-20-20z" 
            fill="white" 
          />
          
          {/* Green check circle */}
          <circle cx="50" cy="40" r="12" fill="#00b05c" />
          <path 
            d="M45 40l3 3 7-7" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* White chart bars */}
          <rect x="60" y="60" width="5" height="20" fill="white" />
          <rect x="70" y="50" width="5" height="30" fill="white" />
          <rect x="80" y="65" width="5" height="15" fill="white" />
          
          {/* Chat bubble */}
          <rect x="75" y="20" width="15" height="15" rx="2" fill="white" />
          <path d="M78 25h2v2h-2z M81 25h2v2h-2z M84 25h2v2h-2z" fill="#0088d2" />
        </svg>
      </div>
      
      {textVisible && (
        <div className="font-bold text-[#2e3538]">
          <div className={`${textSizeClasses[size]} leading-none`}>RANK</div>
          <div className={`${textSizeClasses[size]} leading-none`}>IT</div>
          <div className={`${textSizeClasses[size]} leading-none`}>PRO</div>
        </div>
      )}
    </div>
  );
  
  return (
    <Link href="/">
      {logoContent}
    </Link>
  );
}