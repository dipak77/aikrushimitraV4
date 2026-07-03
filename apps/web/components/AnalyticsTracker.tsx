'use client';

import { useEffect } from 'react';
import { logActivity } from '../services/analyticsService';

interface AnalyticsTrackerProps {
  viewName: string;
  locationName: string;
  actionName?: string;
}

export default function AnalyticsTracker({
  viewName,
  locationName,
  actionName = 'VIEW'
}: AnalyticsTrackerProps) {
  useEffect(() => {
    // Only execute on the client side
    if (typeof window !== 'undefined') {
      logActivity(viewName, locationName, undefined, actionName);
    }
  }, [viewName, locationName, actionName]);

  return null;
}
