import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Utensils, 
  MessageSquare, 
  Coins, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, href, active, badge, onClick }: SidebarItemProps) => (
  <li className="mb-1 px-3">
    <Link 
      href={href}
      className={`flex items-center py-2 px-3 rounded-lg font-medium ${
        active
          ? "text-gray-900 bg-primary-50 dark:bg-sidebar-accent dark:text-sidebar-accent-foreground"
          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
      }`}
    >
      <span className={`mr-3 ${active ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
        {icon}
      </span>
      {label}
      {badge ? (
        <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  </li>
);

export default function Sidebar() {
  const [location] = useLocation();
  
  // For demo purposes, use a static user
  const demoUser = {
    fullName: "Demo Trainer",
    role: "trainer" as const,
    id: 1
  };
  
  const initials = demoUser.fullName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase();

  return (
    <div className="hidden md:flex md:w-64 lg:w-72 flex-col bg-sidebar border-r border-sidebar-border shadow-sm">
      <div className="p-4 flex items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <div className="i-pulse-line text-white text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
          </div>
          <span className="font-display font-bold text-xl text-sidebar-foreground">
            FitCoach<span className="text-primary">Pro</span>
          </span>
        </div>
      </div>

      <div className="py-4 flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-3 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-sidebar-accent rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
              <span className="font-semibold text-primary-700 dark:text-primary-200">{initials}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{demoUser.fullName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{demoUser.role}</p>
            </div>
          </div>
        </div>

        <nav>
          <ul>
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              href="/trainer/dashboard"
              active={location === "/trainer/dashboard" || location === "/trainer"}
            />
            <SidebarItem
              icon={<Users size={18} />}
              label="Clients"
              href="/clients"
              active={location.startsWith("/clients")}
            />
            <SidebarItem
              icon={<Dumbbell size={18} />}
              label="Workouts"
              href="/workouts"
              active={location.startsWith("/workouts")}
            />
            <SidebarItem
              icon={<Dumbbell size={18} className="rotate-45" />}
              label="Exercise Library"
              href="/exercises"
              active={location.startsWith("/exercises")}
            />
            <SidebarItem
              icon={<Utensils size={18} />}
              label="Nutrition"
              href="/nutrition"
              active={location.startsWith("/nutrition")}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/nutrition';
                }
              }}
            />
            <SidebarItem
              icon={<MessageSquare size={18} />}
              label="Messages"
              href="/messages"
              active={location === "/messages"}
              badge={4}
            />
            <SidebarItem
              icon={<Coins size={18} />}
              label="Subscriptions"
              href="/subscriptions"
              active={location === "/subscriptions"}
            />
            <SidebarItem
              icon={<Settings size={18} />}
              label="Settings"
              href="/settings"
              active={location === "/settings"}
            />
          </ul>
        </nav>
      </div>

      <div className="sticky bottom-0 p-4 border-t border-sidebar-border bg-sidebar shadow-md">
        <Button 
          variant="default"
          className="w-full flex items-center justify-center hover:bg-primary-600 transition-colors"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
        >
          <LogOut size={16} className="mr-2" />
          Back to Selector
        </Button>
      </div>
    </div>
  );
}
