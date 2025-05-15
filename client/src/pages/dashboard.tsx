import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/layout/page-header";
import { useAuth } from "@/lib/auth";
import { 
  UserPlus, 
  FileText, 
  CalendarDays 
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import ClientActivity from "@/components/dashboard/client-activity";
import ClientProgress from "@/components/dashboard/client-progress";
import TaskList from "@/components/dashboard/task-list";
import MessagePreview from "@/components/dashboard/message-preview";
import AIAssistant from "@/components/dashboard/ai-assistant";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0], {
          credentials: 'include'
        });
        if (!response.ok) {
          return null;
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return null;
      }
    },
  });

  // Default stats for initial implementation
  const defaultStats = {
    activeClients: 18,
    newClientsThisMonth: 2,
    pendingTasks: 7,
    overdueTasks: 3,
    monthlyRevenue: 3240,
    revenueChange: 12,
    clientRetention: 92,
    retentionChange: 3
  };

  const currentStats = stats || defaultStats;

  return (
    <>
      <PageHeader
        title="Trainer Dashboard"
        description={`Welcome back, ${user?.fullName || 'Trainer'}! Here's an overview of your clients' progress.`}
        actions={[
          {
            label: "Add Client",
            icon: <UserPlus size={18} />,
            href: "/clients/new",
            variant: "outline"
          },
          {
            label: "Create Program",
            icon: <FileText size={18} />,
            href: "/workouts/create",
            variant: "default"
          }
        ]}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<UserPlus className="text-xl text-primary-600" />}
            iconBgColor="bg-primary-100 dark:bg-primary-900"
            title="Active Clients"
            value={currentStats.activeClients}
            trend={{
              value: `+${currentStats.newClientsThisMonth} this month`,
              positive: true
            }}
          />
          
          <StatCard
            icon={<CalendarDays className="text-xl text-accent-600" />}
            iconBgColor="bg-accent-100 dark:bg-accent-900"
            title="Pending Tasks"
            value={currentStats.pendingTasks}
            trend={{
              value: `${currentStats.overdueTasks} overdue`,
              positive: false
            }}
          />
          
          <StatCard
            icon={<svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-xl text-secondary-600"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>}
            iconBgColor="bg-secondary-100 dark:bg-secondary-900"
            title="Monthly Revenue"
            value={`$${currentStats.monthlyRevenue}`}
            trend={{
              value: `+${currentStats.revenueChange}% vs last month`,
              positive: true
            }}
          />
          
          <StatCard
            icon={<svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-xl text-purple-600"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>}
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            title="Client Retention"
            value={`${currentStats.clientRetention}%`}
            trend={{
              value: `+${currentStats.retentionChange}% vs last quarter`,
              positive: true
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ClientActivity />
            <ClientProgress />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <TaskList />
            <MessagePreview />
            <AIAssistant />
          </div>
        </div>
      </main>
    </>
  );
}
