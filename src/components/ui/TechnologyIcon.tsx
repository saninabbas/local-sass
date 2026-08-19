import React from 'react';
import { TechnologyIcon as CoreTechnologyIcon } from '../TechnologyIcon';

export interface TechnologyIconProps {
  name: string;
  size?: number;
  className?: string;
  title?: string;
}

export function TechnologyIcon({ 
  name, 
  size = 20, 
  className = '',
  title 
}: TechnologyIconProps) {
  return (
    <CoreTechnologyIcon 
      technology={name || 'integration'} 
      size={size} 
      className={className} 
      title={title} 
    />
  );
};
