import React from 'react';
import { Button } from '@/components/ui/button';
import ClientHealthMetricsTab from '@/components/clients/client-health-metrics-tab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

// Demo page to showcase the health metrics features without needing login
export default function DemoPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Client Health Metrics Demo</CardTitle>
          <p className="text-muted-foreground">
            Preview of the new habit-building and progress visualization features
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">Back to Login</Button>
            </Link>
          </div>
          
          <ClientHealthMetricsTab client={{
            id: 1,
            name: 'Mick Smith'
          }} />
        </CardContent>
      </Card>
    </div>
  );
}