import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  UserPlus, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Dumbbell
} from "lucide-react";

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  bgColor: string;
  textColor: string;
}

export default function QuickActions() {
  const actions: ActionItem[] = [
    {
      icon: <UserPlus size={24} />,
      label: "Add Client",
      description: "Onboard a new client to your program",
      href: "/clients/new",
      bgColor: "bg-primary-50 dark:bg-primary-950",
      textColor: "text-primary-600 dark:text-primary-400"
    },
    {
      icon: <Dumbbell size={24} />,
      label: "Create Workout",
      description: "Design a new workout program",
      href: "/workouts/create",
      bgColor: "bg-secondary-50 dark:bg-secondary-950",
      textColor: "text-secondary-600 dark:text-secondary-400"
    },
    {
      icon: <FileText size={24} />,
      label: "Nutrition Plan",
      description: "Create a new meal plan",
      href: "/nutrition/create",
      bgColor: "bg-accent-50 dark:bg-accent-950",
      textColor: "text-accent-600 dark:text-accent-400"
    },
    {
      icon: <Calendar size={24} />,
      label: "Schedule Session",
      description: "Book a client training session",
      href: "/schedule/new",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <BarChart3 size={24} />,
      label: "Track Progress",
      description: "Record client progress data",
      href: "/clients/progress/new",
      bgColor: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: <MessageSquare size={24} />,
      label: "Send Message",
      description: "Communicate with your clients",
      href: "/messages/new",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      textColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Link href={action.href} key={index} className="block w-full">
              <div className={`flex items-start p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors ${action.bgColor}`}>
                <div className={`rounded-full p-2 mr-4 ${action.textColor}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}