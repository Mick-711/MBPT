import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Lock, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/client/profile'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const subscription = profileData?.subscription;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>{user?.fullName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user?.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full mt-2">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {subscription && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{subscription.name}</h3>
              <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded text-xs font-medium">
                {subscription.status}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {subscription.description}
            </p>
            <div className="flex justify-between text-sm mb-4">
              <span>{subscription.price}</span>
              <span>Next renewal: {subscription.nextRenewal}</span>
            </div>
            <Link href="/subscription">
              <Button variant="outline" size="sm" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 mb-6">
        <Link href="/profile/personal-info">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <span>Personal Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        
        <Link href="/profile/contact">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <span>Contact Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        
        <Link href="/profile/payment">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        
        <Link href="/profile/password">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <span>Password & Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        
        <Link href="/profile/notifications">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <span>Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="space-y-2 mb-6">
        <Link href="/help">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <span>Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center space-x-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>{logoutMutation.isPending ? "Logging out..." : "Log Out"}</span>
      </Button>
    </div>
  );
}