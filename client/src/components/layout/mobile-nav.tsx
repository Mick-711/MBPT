import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  Menu
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "client") {
    return (
      <nav className="md:hidden flex items-center justify-around bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          href="/"
          active={location === "/"}
        />
        <NavItem
          icon={<Dumbbell size={20} />}
          label="Workouts"
          href="/workouts"
          active={location === "/workouts"}
        />
        <NavItem
          icon={<Utensils size={20} />}
          label="Nutrition"
          href="/nutrition"
          active={location === "/nutrition"}
        />
        <NavItem
          icon={<MessageSquare size={20} />}
          label="Messages"
          href="/messages"
          active={location === "/messages"}
          hasNotification
        />
        <NavItem
          icon={<UserCircle size={20} />}
          label="Profile"
          href="/profile"
          active={location === "/profile"}
        />
      </nav>
    );
  }

  return (
    <nav className="md:hidden flex items-center justify-around bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2">
      <NavItem
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        href="/"
        active={location === "/"}
      />
      <NavItem
        icon={<Users size={20} />}
        label="Clients"
        href="/clients"
        active={location.startsWith("/clients")}
      />
      <NavItem
        icon={<Dumbbell size={20} />}
        label="Workouts"
        href="/workouts"
        active={location.startsWith("/workouts")}
      />
      <NavItem
        icon={<MessageSquare size={20} />}
        label="Messages"
        href="/messages"
        active={location === "/messages"}
        hasNotification
      />
      <NavItem
        icon={<Menu size={20} />}
        label="More"
        href="/more"
        active={location === "/more"}
      />
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasNotification?: boolean;
}

function NavItem({ icon, label, href, active, hasNotification }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center p-2 relative ${active ? "text-primary mobile-nav-active" : "text-gray-500 dark:text-gray-400"}`}>
        <div className="text-xl">{icon}</div>
        <span className="text-xs mt-1">{label}</span>
        {hasNotification && (
          <span className="absolute top-1 right-7 h-2 w-2 bg-destructive rounded-full"></span>
        )}
      </a>
    </Link>
  );
}

// Additional icons for client mobile nav
function Utensils(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2H11v13c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2Z" />
    </svg>
  );
}

function UserCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
