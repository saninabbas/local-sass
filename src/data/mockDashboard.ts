import type { DashboardData } from '../types';

export const mockDashboardData: DashboardData = {
  user: {
    id: 'usr_123',
    name: 'Alex',
    email: 'alex@abcdental.com'
  },
  business: {
    id: 'biz_123',
    name: 'ABC Dental',
    city: 'Islamabad',
    websiteUrl: 'https://abcdental.com'
  },
  growthScore: {
    overall: 78,
    previousScore: 72,
    change: 6,
    seo: 82,
    reviews: 74,
    website: 86,
    visibility: 69,
    progressHistory: [72, 73, 74, 76, 78],
    lastAudited: 'Today at 10:42 AM',
  },
  recommendations: [
    {
      id: '1',
      title: 'Respond to unanswered reviews',
      priority: 'HIGH PRIORITY',
      priorityColor: 'text-danger bg-red-50 border-red-100',
      description: '8 recent reviews are waiting for a response.',
      impact: 'High',
      estimatedTime: '15 min',
      status: 'pending',
      actionLink: '/dashboard/reviews'
    },
    {
      id: '2',
      title: 'Create missing service pages',
      priority: 'MEDIUM PRIORITY',
      priorityColor: 'text-warning bg-orange-50 border-orange-100',
      description: '3 important service pages are missing.',
      impact: 'Medium',
      estimatedTime: '30 min',
      status: 'pending',
      actionLink: '/dashboard/website'
    },
    {
      id: '3',
      title: 'Fix website issues',
      priority: 'MEDIUM PRIORITY',
      priorityColor: 'text-warning bg-orange-50 border-orange-100',
      description: '2 issues detected.',
      impact: 'Medium',
      estimatedTime: '20 min',
      status: 'pending',
      actionLink: '/dashboard/website'
    }
  ]
};
