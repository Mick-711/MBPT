import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/layout/page-header";
import { useAuth } from "@/lib/auth";
import { 
  UserPlus, 
  FileText, 
  CalendarDays,
  DollarSign,
  Users,
  Trophy
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import ClientActivity from "@/components/dashboard/client-activity";
import ClientProgress from "@/components/dashboard/client-progress";
import TaskList from "@/components/dashboard/task-list";
import MessagePreview from "@/components/dashboard/message-preview";
import AIAssistant from "@/components/dashboard/ai-assistant";
import QuickActions from "@/components/dashboard/quick-actions";
import ClientPerformanceChart from "@/components/dashboard/client-performance-chart";
import ClientHealthMetrics from "@/components/dashboard/client-health-metrics";

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
    retentionChange: 3,
    completedWorkouts: 142,
    workoutChange: 8,
    goalsAchieved: 15,
    goalsChange: 25
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={<Users className="text-xl text-primary-600" />}
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
            icon={<DollarSign className="text-xl text-secondary-600" />}
            iconBgColor="bg-secondary-100 dark:bg-secondary-900"
            title="Monthly Revenue"
            value={`$${currentStats.monthlyRevenue}`}
            trend={{
              value: `+${currentStats.revenueChange}% vs last month`,
              positive: true
            }}
          />

          <StatCard
            icon={<Trophy className="text-xl text-green-600" />}
            iconBgColor="bg-green-100 dark:bg-green-900"
            title="Goals Achieved"
            value={currentStats.goalsAchieved}
            trend={{
              value: `+${currentStats.goalsChange}% this month`,
              positive: true
            }}
          />
          
          <StatCard
            icon={<UserPlus className="text-xl text-blue-600" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            title="Client Retention"
            value={`${currentStats.clientRetention}%`}
            trend={{
              value: `+${currentStats.retentionChange}% vs last quarter`,
              positive: true
            }}
          />

          <StatCard
            icon={<CalendarDays className="text-xl text-purple-600" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            title="Completed Workouts"
            value={currentStats.completedWorkouts}
            trend={{
              value: `+${currentStats.workoutChange}% vs last month`,
              positive: true
            }}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <QuickActions />
        </div>

        {/* Health metrics */}
        <div className="mb-6">
          <ClientHealthMetrics />
        </div>

        {/* Charts and detailed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            <ClientPerformanceChart />
          </div>
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
