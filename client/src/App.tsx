import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import MobileClientNav from "@/components/layout/mobile-client-nav";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ClientsList from "@/pages/clients/index";
import ClientDetails from "@/pages/clients/client-details";
import WorkoutsList from "@/pages/workouts/index";
import CreateWorkout from "@/pages/workouts/create";

// These imports will be uncommented when the files are created
// import NutritionList from "@/pages/nutrition/index";
// import CreateNutrition from "@/pages/nutrition/create";
// import Messages from "@/pages/messages";
// import Subscriptions from "@/pages/subscriptions";
// import Settings from "@/pages/settings";

// Mobile client pages
import ClientDashboard from "./pages/mobile/client/dashboard";
import ClientWorkouts from "./pages/mobile/client/workouts";
import ClientNutrition from "./pages/mobile/client/nutrition";
import ClientProgress from "./pages/mobile/client/progress";
import ClientMessages from "./pages/mobile/client/messages";
import ClientProfile from "./pages/mobile/client/profile";

// Auth
import { useAuth } from "@/lib/auth";
import { useMobile } from "@/hooks/use-mobile";

// Define user interface
interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  role?: 'trainer' | 'client';
  profileImage?: string;
}

function AuthenticatedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return isAuthenticated ? <Component {...rest} /> : null;
}

function ClientRoute({ component: Component, ...rest }: any) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const extendedUser = user as User | null;
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (extendedUser && extendedUser.role !== "client"))) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, extendedUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return isAuthenticated && extendedUser && extendedUser.role === "client" ? <Component {...rest} /> : null;
}

function TrainerRoute({ component: Component, ...rest }: any) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const extendedUser = user as User | null;
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (extendedUser && extendedUser.role !== "trainer"))) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, extendedUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return isAuthenticated && extendedUser && extendedUser.role === "trainer" ? <Component {...rest} /> : null;
}

function Router() {
  const { user } = useAuth();
  const extendedUser = user as User | null;
  const isMobile = useMobile();

  // Direct clients to their mobile interface
  if (extendedUser?.role === "client" && isMobile) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={(props) => <ClientRoute component={ClientDashboard} {...props} />} />
        <Route path="/workouts" component={(props) => <ClientRoute component={ClientWorkouts} {...props} />} />
        <Route path="/nutrition" component={(props) => <ClientRoute component={ClientNutrition} {...props} />} />
        <Route path="/progress" component={(props) => <ClientRoute component={ClientProgress} {...props} />} />
        <Route path="/messages" component={(props) => <ClientRoute component={ClientMessages} {...props} />} />
        <Route path="/profile" component={(props) => <ClientRoute component={ClientProfile} {...props} />} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Trainer/admin routes or desktop client view
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={(props) => <TrainerRoute component={Dashboard} {...props} />} />
      <Route path="/clients" component={(props) => <TrainerRoute component={ClientsList} {...props} />} />
      <Route path="/clients/:id" component={(props) => <TrainerRoute component={ClientDetails} {...props} />} />
      <Route path="/workouts" component={(props) => <TrainerRoute component={WorkoutsList} {...props} />} />
      <Route path="/workouts/create" component={(props) => <TrainerRoute component={CreateWorkout} {...props} />} />
      {/* 
      Uncomment these routes when the components are created
      <Route path="/nutrition" component={(props) => <TrainerRoute component={NutritionList} {...props} />} />
      <Route path="/nutrition/create" component={(props) => <TrainerRoute component={CreateNutrition} {...props} />} />
      <Route path="/messages" component={(props) => <AuthenticatedRoute component={Messages} {...props} />} />
      <Route path="/subscriptions" component={(props) => <TrainerRoute component={Subscriptions} {...props} />} />
      <Route path="/settings" component={(props) => <AuthenticatedRoute component={Settings} {...props} />} />
      */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const extendedUser = user as User | null;
  const isMobile = useMobile();
  const [location] = useLocation();

  // Don't show layout on login/register pages
  const isAuthPage = location === "/login" || location === "/register";
  
  // Determine if we're in the mobile client app
  const isClientMobileApp = isMobile && extendedUser?.role === "client";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || isAuthPage) {
    return (
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    );
  }

  // For mobile client app, show client mobile nav
  if (isClientMobileApp) {
    return (
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen pb-16"> {/* Add padding for bottom nav */}
          <Router />
          <MobileClientNav />
        </div>
      </TooltipProvider>
    );
  }

  // For trainer web app, show sidebar and navigation
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen flex flex-col md:flex-row">
        {!isMobile && <Sidebar />}
        <div className="flex-1 flex flex-col min-h-screen">
          <Router />
          {isMobile && <MobileNav />}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
