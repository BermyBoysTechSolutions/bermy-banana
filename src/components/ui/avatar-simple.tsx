// Simple avatar component for save-as-avatar functionality
import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  children?: React.ReactNode;
  className?: string;
}

export function Avatar({ children, className = "" }: AvatarProps) {
  return (
    <div className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full ${className}`}>
      {children || <User className="w-6 h-6 text-gray-600" />}
    </div>
  );
}

export function AvatarImage({ src, alt = "Avatar", className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-full object-cover ${className}`}
      onError={(e) => {
        e.currentTarget.src = '/api/placeholder/40/40';
      }}
    />
  );
}

export function AvatarFallback({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 ${className}`}>
      {children || <User className="w-5 h-5 text-gray-600" />}
    </div>
  );
}