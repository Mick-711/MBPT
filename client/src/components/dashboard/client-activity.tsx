import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  ActivityIcon,
  CheckCircle,
  Clock,
  Flame,
  Image,
  HandPlatter,
  Calendar
} from "lucide-react";

interface ClientActivityItemProps {
  activity: {
    id: number;
    clientId: number;
    activityType: 'workout_completed' | 'progress_update' | 'nutrition_started' | 'message_sent';
    activityDate: string;
    details: any;
    relatedEntityId: number;
    relatedEntityType: string;
  };
  user: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
}

const ClientActivityItem = ({ activity, user }: ClientActivityItemProps) => {
  // Format activity date
  const activityTime = format(new Date(activity.activityDate), "h:mm a");
  const activityDate = format(new Date(activity.activityDate), "MMM dd");
  const displayDate = new Date(activity.activityDate).toDateString() === new Date().toDateString() 
    ? `Today, ${activityTime}` 
    : `${activityDate}, ${activityTime}`;

  // Render different activity items based on type
  const renderActivity = () => {
    switch (activity.activityType) {
      case 'workout_completed':
        return (
          <>
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-secondary-500 border-2 border-white dark:border-gray-900"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">
                  {user.fullName} completed <span className="font-semibold">{activity.details?.workoutName || "workout"}</span>
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Flame className="text-accent-500 mr-1" size={14} />
                    {activity.details?.caloriesBurned || "0"} calories
                  </span>
                </div>
              </div>
              <div className="sm:flex items-center space-x-2 mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300">
                  Completed
                </span>
                <Link href={`/workouts/${activity.details?.planId}/workout/${activity.relatedEntityId}`}>
                  <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto font-medium">
                    View details
                  </Button>
                </Link>
              </div>
            </div>
          </>
        );
      
      case 'nutrition_started':
        return (
          <>
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-accent-500 border-2 border-white dark:border-gray-900"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">
                  {user.fullName} started <span className="font-semibold">{activity.details?.planName || "meal plan"}</span>
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <HandPlatter className="text-accent-500 mr-1" size={14} />
                    {activity.details?.phase || "Week 1, Day 1"}
                  </span>
                </div>
              </div>
              <div className="sm:flex items-center space-x-2 mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300">
                  In Progress
                </span>
                <Link href={`/nutrition/${activity.relatedEntityId}`}>
                  <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto font-medium">
                    View plan
                  </Button>
                </Link>
              </div>
            </div>
          </>
        );
      
      case 'progress_update':
        return (
          <>
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-primary-500 border-2 border-white dark:border-gray-900"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">
                  {user.fullName} sent <span className="font-semibold">progress photos</span> for review
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Image className="text-primary-500 mr-1" size={14} />
                    {activity.details?.description || "Progress update"}
                  </span>
                </div>
              </div>
              <div className="sm:flex items-center space-x-2 mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive dark:bg-destructive/30">
                  Needs Review
                </span>
                <Link href={`/clients/${user.id}/progress/${activity.relatedEntityId}`}>
                  <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto font-medium">
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          </>
        );
      
      case 'message_sent':
        return (
          <>
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-primary-500 border-2 border-white dark:border-gray-900"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">
                  {user.fullName} sent you a <span className="font-semibold">message</span>
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <ActivityIcon className="text-primary-500 mr-1" size={14} />
                    {activity.details?.preview || "New message"}
                  </span>
                </div>
              </div>
              <div className="sm:flex items-center space-x-2 mt-2 sm:mt-0">
                <Link href={`/messages/${user.id}`}>
                  <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto font-medium">
                    Reply
                  </Button>
                </Link>
              </div>
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-gray-300 border-2 border-white dark:border-gray-900"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">
                  {user.fullName} missed <span className="font-semibold">scheduled activity</span>
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Calendar className="text-gray-500 mr-1" size={14} />
                    Missed activity
                  </span>
                </div>
              </div>
              <div className="sm:flex items-center space-x-2 mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Missed
                </span>
                <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto font-medium">
                  Send reminder
                </Button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative pl-6 pb-6 before:absolute before:top-0 before:left-2 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
      {renderActivity()}
    </div>
  );
};

export default function ClientActivity() {
  // Fetch client activities
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0]);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });

  // Mock user data to be replaced with actual user data
  const mockUsers = {
    1: { id: 1, fullName: "Sarah Johnson", profileImage: "" },
    2: { id: 2, fullName: "Mike Thompson", profileImage: "" },
    3: { id: 3, fullName: "Emma Williams", profileImage: "" },
    4: { id: 4, fullName: "Jason Lee", profileImage: "" },
  };

  // Hard-coded activities for the initial implementation
  const defaultActivities = [
    {
      id: 1,
      clientId: 1,
      activityType: 'workout_completed' as const,
      activityDate: new Date().toISOString(),
      details: { workoutName: "Upper Body Strength", caloriesBurned: 320, planId: 1 },
      relatedEntityId: 1,
      relatedEntityType: 'workout',
    },
    {
      id: 2,
      clientId: 2,
      activityType: 'nutrition_started' as const,
      activityDate: new Date().toISOString(),
      details: { planName: "Weight Loss Meal Plan", phase: "Week 1, Day 1" },
      relatedEntityId: 1,
      relatedEntityType: 'nutrition',
    },
    {
      id: 3,
      clientId: 3,
      activityType: 'progress_update' as const,
      activityDate: new Date().toISOString(),
      details: { description: "Month 2 comparison" },
      relatedEntityId: 1,
      relatedEntityType: 'progress',
    },
    {
      id: 4,
      clientId: 4,
      activityType: 'message_sent' as const,
      activityDate: new Date().toISOString(),
      details: { preview: "Question about today's workout" },
      relatedEntityId: 1,
      relatedEntityType: 'message',
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">Today's Client Activity</h2>
          <Link href="/clients">
            <Button variant="link" className="text-sm text-primary-600 p-0 h-auto font-medium">
              View all
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>Failed to load client activities</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            {(activities?.length > 0 ? activities : defaultActivities).map((activity) => (
              <ClientActivityItem 
                key={activity.id} 
                activity={activity} 
                user={mockUsers[activity.clientId as keyof typeof mockUsers]} 
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
