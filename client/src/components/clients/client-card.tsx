import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ChevronRight, 
  MessageSquare, 
  BarChart3, 
  Dumbbell 
} from "lucide-react";

interface ClientCardProps {
  client: {
    id: number;
    userId: number;
    fullName: string;
    profileImage?: string;
    email: string;
    program?: string;
    startDate?: string;
    lastActivity?: string;
    status?: 'active' | 'pending' | 'inactive';
    goals?: string;
  };
}

export default function ClientCard({ client }: ClientCardProps) {
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300';
      case 'pending':
        return 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not started';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {client.profileImage ? (
                <img 
                  src={client.profileImage} 
                  alt={client.fullName} 
                  className="h-12 w-12 rounded-full object-cover" 
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                  {client.fullName.split(" ").map(n => n[0]).join("")}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{client.fullName}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(client.status)}`}>
                  {client.status || 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client.email}</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Program:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{client.program || 'None assigned'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Started:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(client.startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Last activity:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{client.lastActivity || 'Never'}</span>
            </div>
          </div>
          
          {client.goals && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Goals:</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{client.goals}</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 flex">
          <Link href={`/messages/${client.userId}`}>
            <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 text-gray-600 dark:text-gray-300">
              <MessageSquare size={14} className="mr-1" />
              Message
            </Button>
          </Link>
          <div className="border-l border-gray-100 dark:border-gray-800"></div>
          <Link href={`/clients/${client.id}/progress`}>
            <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 text-gray-600 dark:text-gray-300">
              <BarChart3 size={14} className="mr-1" />
              Progress
            </Button>
          </Link>
          <div className="border-l border-gray-100 dark:border-gray-800"></div>
          <Link href={`/clients/${client.id}`}>
            <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 text-gray-600 dark:text-gray-300">
              <Dumbbell size={14} className="mr-1" />
              Workouts
            </Button>
          </Link>
          <div className="border-l border-gray-100 dark:border-gray-800"></div>
          <Link href={`/clients/${client.id}`}>
            <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 text-primary-600">
              <ChevronRight size={14} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
