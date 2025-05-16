import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  TrendingUp, 
  Users, 
  Target
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HealthMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function ClientHealthMetrics() {
  // Fetch health metrics data
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/trainer/health-metrics'],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0], {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch health metrics');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching health metrics:", error);
        return null;
      }
    },
  });

  // Default metrics data
  const defaultMetrics: HealthMetric[] = [
    {
      label: "Average Weight Loss",
      value: "4.8 lbs",
      change: 12,
      icon: <TrendingUp size={18} />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      label: "Avg. Resting Heart Rate",
      value: "68 bpm",
      change: -4,
      icon: <Heart size={18} />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    },
    {
      label: "Clients w/ Goal Progress",
      value: "85%",
      change: 5,
      icon: <Target size={18} />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      label: "Client Satisfaction",
      value: "4.9/5",
      change: 2,
      icon: <Users size={18} />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  const currentMetrics = metrics || defaultMetrics;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Client Health Metrics
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            ))
          ) : (
            currentMetrics.map((metric, index) => (
              <div 
                key={index} 
                className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center mb-2">
                  <div className={`rounded-full p-2 ${metric.bgColor} ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {metric.label}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}