import React from "react";
import { Link } from "wouter";
import logoImage from "@assets/rank it pro logo.png";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textVisible?: boolean;
}

export function Logo({ className = "", size = 'md', textVisible = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20'
  };

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="Rank it Pro Logo" 
        className={`${sizeClasses[size]} ${!textVisible ? 'w-auto' : ''}`}
        style={!textVisible ? { aspectRatio: '1/1', objectFit: 'contain' } : {}}
      />
    </div>
  );
  
  return (
    <Link href="/">
      {logoContent}
    </Link>
  );
}