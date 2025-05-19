import React from "react";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textVisible?: boolean;
}

export function Logo({ className = "", size = 'md', textVisible = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <Link href="/">
      <a className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          {/* Main Square with blue background */}
          <div className={`${sizeClasses[size]} bg-primary rounded-md flex items-center justify-center`}>
            {/* White pin/location marker */}
            <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-white">
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
          </div>
          
          {/* Green circle with checkmark */}
          <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
            <div className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} bg-secondary rounded-full flex items-center justify-center`}>
              <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white">
                <path
                  fill="currentColor"
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                />
              </svg>
            </div>
          </div>
          
          {/* Bar chart in the background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
            <svg viewBox="0 0 24 24" className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-white`}>
              <path
                fill="currentColor"
                d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"
              />
            </svg>
          </div>
          
          {/* Blue chat bubble in top right */}
          <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
            <svg viewBox="0 0 24 24" className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} text-primary`}>
              <path
                fill="currentColor"
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
              />
              <path
                fill="currentColor"
                d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"
              />
            </svg>
          </div>
        </div>
        
        {textVisible && (
          <div className="font-bold text-foreground">
            <div className="text-xl leading-none">RANK</div>
            <div className="text-xl leading-none">IT</div>
            <div className="text-xl leading-none">PRO</div>
          </div>
        )}
      </a>
    </Link>
  );
}