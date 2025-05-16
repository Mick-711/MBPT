import { Link, useLocation } from 'wouter';
import { Home, Dumbbell, Apple, ChartBar, MessageSquare, User } from 'lucide-react';

export default function MobileClientNav() {
  const [location] = useLocation();

  // Navigation items for the bottom bar
  const navItems = [
    {
      name: 'Dashboard',
      href: '/mobile/client/dashboard',
      icon: Home,
      active: location === '/mobile/client/dashboard' || location === '/',
    },
    {
      name: 'Workouts',
      href: '/mobile/client/workouts',
      icon: Dumbbell,
      active: location.includes('/workouts'),
    },
    {
      name: 'Nutrition',
      href: '/mobile/client/nutrition',
      icon: Apple,
      active: location.includes('/nutrition'),
    },
    {
      name: 'Progress',
      href: '/mobile/client/progress',
      icon: ChartBar,
      active: location.includes('/progress'),
    },
    {
      name: 'Messages',
      href: '/mobile/client/messages',
      icon: MessageSquare,
      active: location.includes('/messages'),
    },
    {
      name: 'Profile',
      href: '/mobile/client/profile',
      icon: User,
      active: location.includes('/profile'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t py-2 px-1">
      <div className="grid grid-cols-6 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="flex flex-col items-center justify-center"
          >
            <div 
              className={`p-1 rounded-full ${
                item.active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span 
              className={`text-[10px] mt-1 ${
                item.active 
                  ? 'font-medium text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}