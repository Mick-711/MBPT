import React, { useEffect, useState, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";

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
import NewClient from "@/pages/clients/new";
import ClientDetails from "@/pages/clients/client-details";
import WorkoutsList from "@/pages/workouts/index";
import CreateWorkout from "@/pages/workouts/create";
import ViewSwitcher from "@/pages/view-switcher";
import ExercisesLibrary from "@/pages/exercises/index";
import NewExercise from "@/pages/exercises/new";
import ImportExercises from "@/pages/exercises/import";

// Nutrition pages
import NutritionDashboard from "@/pages/nutrition/index";
import FoodDatabase from "@/pages/nutrition/food-database/index";
import AddFood from "@/pages/nutrition/food-database/new/index";
import MealPlans from "@/pages/nutrition/meal-plans/index";
import MacroCalculator from "@/pages/nutrition/calculator/index";

// Mobile client pages
import ClientDashboard from "./pages/mobile/client/dashboard";
import ClientWorkouts from "./pages/mobile/client/workouts";
import ClientNutrition from "./pages/mobile/client/nutrition";
import ClientProgress from "./pages/mobile/client/progress";
import ClientMessages from "./pages/mobile/client/messages";
import ClientProfile from "./pages/mobile/client/profile";

// Progress tracking sub-pages
import ClientPerformance from "./pages/mobile/client/progress/performance";
import ClientHabits from "./pages/mobile/client/progress/habits";
import ClientHydration from "./pages/mobile/client/progress/hydration";

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

  // For demo purposes, provide direct access to both views through a selector page
  return (
    <Switch>
      {/* Main view selector for demo purposes */}
      <Route path="/" component={ViewSwitcher} />
      
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/demo">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          {React.createElement(React.lazy(() => import('./pages/demo')))}
        </Suspense>
      </Route>
      
      {/* Client routes */}
      <Route path="/mobile/client/dashboard" component={ClientDashboard} />
      <Route path="/mobile/client/workouts" component={ClientWorkouts} />
      <Route path="/mobile/client/nutrition" component={ClientNutrition} />
      <Route path="/mobile/client/progress" component={ClientProgress} />
      <Route path="/mobile/client/messages" component={ClientMessages} />
      <Route path="/mobile/client/profile" component={ClientProfile} />
      
      {/* Progress tracking sub-pages */}
      <Route path="/progress" component={ClientProgress} />
      <Route path="/progress/performance" component={ClientPerformance} />
      <Route path="/progress/habits" component={ClientHabits} />
      <Route path="/progress/hydration" component={ClientHydration} />
      
      {/* Legacy client routes for backward compatibility */}
      <Route path="/workouts" component={ClientWorkouts} />
      <Route path="/nutrition" component={ClientNutrition} />
      <Route path="/messages" component={ClientMessages} />
      <Route path="/profile" component={ClientProfile} />
      
      {/* Trainer routes */}
      <Route path="/trainer/dashboard" component={Dashboard} />
      <Route path="/trainer" component={Dashboard} />
      <Route path="/clients" component={ClientsList} />
      <Route path="/clients/new" component={NewClient} />
      <Route path="/clients/:id" component={ClientDetails} />
      <Route path="/workouts" component={WorkoutsList} />
      <Route path="/workouts/create" component={CreateWorkout} />
      
      {/* Exercise Library routes */}
      <Route path="/exercises" component={ExercisesLibrary} />
      <Route path="/exercises/new" component={NewExercise} />
      <Route path="/exercises/import" component={ImportExercises} />
      
      {/* Nutrition routes */}
      <Route path="/nutrition" component={NutritionDashboard} />
      <Route path="/nutrition/food-database" component={FoodDatabase} />
      <Route path="/nutrition/food-database/new" component={AddFood} />
      <Route path="/nutrition/meal-plans" component={MealPlans} />
      <Route path="/nutrition/meal-plans/new" component={React.lazy(() => import('./pages/nutrition/meal-plans/new'))} />
      <Route path="/nutrition/calculator" component={MacroCalculator} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const extendedUser = user as User | null;
  const isMobile = useMobile();
  const [location] = useLocation();

  // Don't show layout on login/register pages or the view switcher page
  const isSpecialPage = location === "/login" || location === "/register" || location === "/";
  
  // For simplicity, we'll consider all routes under /mobile as client app routes
  const isClientMobileApp = location.startsWith("/mobile");
  
  // These are all the routes that should have the trainer dashboard layout
  const isTrainerDashboard = location.startsWith("/trainer") || 
                           location === "/clients" || 
                           location.startsWith("/clients/") || 
                           (location === "/workouts" && !location.startsWith("/mobile")) || 
                           location.startsWith("/workouts/") ||
                           !isClientMobileApp && !isSpecialPage;
  
  // Read from localStorage to initialize global flag as fallback
  try {
    if (typeof window !== 'undefined') {
      if (isClientMobileApp) {
        window.IS_TRAINER_VIEW = false;
      } else if (isTrainerDashboard) {
        window.IS_TRAINER_VIEW = true;
      }
    }
  } catch (e) {
    console.error('Could not set trainer view flag', e);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // For login, register, or view switcher page
  if (isSpecialPage) {
    return (
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    );
  }

  // For mobile client app, show client mobile nav
  if (isClientMobileApp) {
    // When we enter the client section, set the flag for client view
    if (typeof window !== 'undefined') {
      window.IS_TRAINER_VIEW = false;
    }
    
    return (
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen pb-16"> {/* Add padding for bottom nav */}
          <div className="sticky top-0 z-50 bg-primary text-white p-2 text-center font-medium shadow-md">
            <button 
              onClick={() => window.location.href = '/'} 
              className="flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 rotate-180">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Back to View Selector
            </button>
          </div>
          <Router />
          <MobileClientNav />
        </div>
      </TooltipProvider>
    );
  }

  // For trainer web app, show sidebar and navigation
  if (isTrainerDashboard) {
    // When we enter the trainer section, set the flag for trainer view
    if (typeof window !== 'undefined') {
      window.IS_TRAINER_VIEW = true;
    }
    
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
  
  // Default case
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;