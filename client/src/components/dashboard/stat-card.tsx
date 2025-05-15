import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  icon: ReactNode;
  iconBgColor: string;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export default function StatCard({ icon, iconBgColor, title, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div className={`rounded-full ${iconBgColor} p-3 mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <h3 className="text-2xl font-display font-bold">{value}</h3>
          {trend && (
            <p className={`text-xs flex items-center mt-1 ${trend.positive ? 'text-secondary-500 dark:text-secondary-400' : 'text-destructive'}`}>
              {trend.positive ? (
                <ArrowUp className="mr-1" size={12} />
              ) : (
                <ArrowDown className="mr-1" size={12} />
              )}
              <span>{trend.value}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
