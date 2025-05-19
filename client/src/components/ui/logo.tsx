import React from "react";
import { Link, useRoute } from "wouter";
import logoImage from "@assets/rank it pro logo.png";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textVisible?: boolean;
  linkDisabled?: boolean;
}

export function Logo({ className = "", size = 'md', textVisible = true, linkDisabled = false }: LogoProps) {
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
  
  // If linkDisabled is true or if we're in a context where wrapping in a Link would cause nested anchors
  // (e.g., when used inside another Link/anchor), just return the content without the Link wrapper
  if (linkDisabled) {
    return logoContent;
  }
  
  return (
    <Link href="/">
      {logoContent}
    </Link>
  );
}