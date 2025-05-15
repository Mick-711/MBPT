import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ProgressClientProps {
  client: {
    id: number;
    fullName: string;
    profileImage?: string;
    programName: string;
    programProgress: number;
    month: number;
    metrics: {
      weight: { value: number; change: number };
      bodyFat?: { value: number; change: number };
      muscleMass?: { value: number; change: number };
      strength?: { value: number; change: number };
      adherence: { value: number; change: number };
    };
    weightChange: number;
  };
}

const ProgressClient = ({ client }: ProgressClientProps) => {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {client.profileImage ? (
            <img 
              src={client.profileImage} 
              alt={client.fullName} 
              className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
              {client.fullName.split(" ").map(n => n[0]).join("")}
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{client.fullName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{client.programName} • Month {client.month}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${client.weightChange < 0 ? 'text-secondary-600 dark:text-secondary-400' : 'text-primary-600 dark:text-primary-400'}`}>
            {client.weightChange > 0 ? '+' : ''}{client.weightChange} lbs
          </span>
          {client.weightChange < 0 ? (
            <ArrowDown className="text-secondary-600 dark:text-secondary-400" size={16} />
          ) : (
            <ArrowUp className="text-primary-600 dark:text-primary-400" size={16} />
          )}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weight</p>
          <div className="font-medium">
            {client.metrics.weight.value} lbs
            <span className={`text-xs ml-1 ${client.metrics.weight.change < 0 ? 'text-secondary-500 dark:text-secondary-400' : 'text-primary-500 dark:text-primary-400'}`}>
              {client.metrics.weight.change > 0 ? '+' : ''}{client.metrics.weight.change}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {client.metrics.bodyFat ? 'Body Fat' : 'Muscle Mass'}
          </p>
          <div className="font-medium">
            {client.metrics.bodyFat ? client.metrics.bodyFat.value : client.metrics.muscleMass?.value}%
            <span className={`text-xs ml-1 ${
              (client.metrics.bodyFat?.change || 0) < 0 || (client.metrics.muscleMass?.change || 0) > 0 
              ? 'text-secondary-500 dark:text-secondary-400' 
              : 'text-primary-500 dark:text-primary-400'
            }`}>
              {(client.metrics.bodyFat?.change || client.metrics.muscleMass?.change || 0) > 0 ? '+' : ''}
              {client.metrics.bodyFat?.change || client.metrics.muscleMass?.change}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Strength</p>
          <div className="font-medium">
            {client.metrics.strength?.change && client.metrics.strength.change > 0 ? '+' : ''}
            {client.metrics.strength?.change || 0}%
            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">↑</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adherence</p>
          <div className="font-medium">
            {client.metrics.adherence.value}%
            <span className={`text-xs ml-1 ${client.metrics.adherence.change >= 0 ? 'text-accent-500 dark:text-accent-400' : 'text-destructive'}`}>
              {client.metrics.adherence.change > 0 ? '+' : ''}{client.metrics.adherence.change}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-2 bg-secondary-500 dark:bg-secondary-600 rounded-full" 
          style={{ width: `${client.programProgress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Program progress</span>
        <span className="text-xs font-medium">{client.programProgress}%</span>
      </div>
    </div>
  );
};

export default function ClientProgress() {
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('monthly');
  
  // Fetch client progress data
  const { data: clientsProgress, isLoading, error } = useQuery({
    queryKey: ['/api/clients/progress', timeFrame],
    queryFn: async ({ queryKey }) => {
      const [url, period] = queryKey;
      const response = await fetch(`${url}?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client progress');
      }
      return response.json();
    },
  });

  // Default client progress data for initial implementation
  const defaultClients = [
    {
      id: 1,
      fullName: "Sarah Johnson",
      profileImage: "",
      programName: "Weight Loss Program",
      programProgress: 75,
      month: 3,
      metrics: {
        weight: { value: 152, change: -8 },
        bodyFat: { value: 24, change: -4 },
        strength: { value: 0, change: 15 },
        adherence: { value: 92, change: 2 }
      },
      weightChange: -12.4
    },
    {
      id: 2,
      fullName: "Michael Thompson",
      profileImage: "",
      programName: "Muscle Building",
      programProgress: 45,
      month: 2,
      metrics: {
        weight: { value: 182, change: 5 },
        muscleMass: { value: 68, change: 3 },
        strength: { value: 0, change: 22 },
        adherence: { value: 88, change: -4 }
      },
      weightChange: 8.2
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">
            Client Progress Highlights
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant={timeFrame === 'weekly' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('weekly')}
              className="text-sm"
            >
              Weekly
            </Button>
            <Button 
              variant={timeFrame === 'monthly' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('monthly')}
              className="text-sm"
            >
              Monthly
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
              ))}
            </>
          ) : error ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>Failed to load client progress</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : (
            <>
              {(clientsProgress?.length > 0 ? clientsProgress : defaultClients).map((client) => (
                <ProgressClient key={client.id} client={client} />
              ))}
            </>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/clients">
            <Button variant="outline" className="inline-flex items-center justify-center">
              View all clients
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="ml-2 h-4 w-4"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
