import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewSwitcher() {
  const [_, setLocation] = useLocation();

  const goToTrainerView = () => {
    // Set the global flag for trainer view
    window.IS_TRAINER_VIEW = true;
    setLocation('/trainer/dashboard');
  };

  const goToClientView = () => {
    // Set the global flag for client view
    window.IS_TRAINER_VIEW = false;
    setLocation('/mobile/client/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">View Selector</CardTitle>
          <CardDescription className="text-center">
            Choose which interface you'd like to view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 border rounded-lg bg-primary/5">
            <h3 className="text-lg font-medium mb-2">Trainer View</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access the trainer dashboard with client management features
            </p>
            <Button 
              size="lg" 
              className="w-full" 
              onClick={goToTrainerView}
            >
              Enter Trainer View
            </Button>
          </div>
          
          <div className="text-center p-4 border rounded-lg bg-primary/5">
            <h3 className="text-lg font-medium mb-2">Client View</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access the mobile client interface with progress tracking
            </p>
            <Button 
              size="lg" 
              className="w-full" 
              variant="secondary"
              onClick={goToClientView}
            >
              Enter Client View
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          No login required - for demonstration purposes only
        </CardFooter>
      </Card>
    </div>
  );
}