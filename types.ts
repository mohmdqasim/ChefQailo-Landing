
// Add React import to resolve 'Cannot find namespace React' error
import React from 'react';

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
