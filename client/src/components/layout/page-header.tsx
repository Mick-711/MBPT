import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: {
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
    className?: string;
  }[];
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
          </div>
          {actions && actions.length > 0 && (
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {actions.map((action, index) => (
                action.href ? (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant={action.variant || "default"} 
                      className={action.className}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    key={index} 
                    variant={action.variant || "default"} 
                    onClick={action.onClick}
                    className={action.className}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
