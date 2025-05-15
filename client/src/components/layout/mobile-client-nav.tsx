import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Dumbbell, Pizza, BarChart3, MessageSquare, User } from 'lucide-react';

export default function MobileClientNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/nutrition', label: 'Nutrition', icon: Pizza },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-between px-2">
        {navItems.map((item, index) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={index} 
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 text-xs ${
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}