import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  FileText, 
  Search, 
  Filter,
  Loader2,
  DumbbellIcon,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function WorkoutsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Fetch workouts
  const { data: workouts, isLoading, error } = useQuery({
    queryKey: ['/api/workouts', typeFilter, sortBy],
    queryFn: async ({ queryKey }) => {
      const [url, type, sort] = queryKey;
      const params = new URLSearchParams();
      
      if (type !== 'all') {
        params.append('type', type as string);
      }
      
      if (sort) {
        params.append('sort', sort as string);
      }
      
      const queryUrl = `${url}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(queryUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      return response.json();
    }
  });

  // Filter workouts by search query
  const filteredWorkouts = workouts?.filter((workout: any) => {
    if (!searchQuery.trim()) return true;
    
    const name = workout.name.toLowerCase();
    const description = (workout.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || description.includes(query);
  });

  // Demo workouts for initial implementation
  const demoWorkouts = [
    {
      id: 1,
      name: "12-Week Weight Loss Program",
      description: "Progressive workout plan focusing on fat loss and conditioning",
      clientId: 1,
      clientName: "Sarah Johnson",
      startDate: "2023-07-15T00:00:00Z",
      endDate: "2023-10-07T00:00:00Z",
      isTemplate: false,
      type: "assigned",
      status: "in_progress"
    },
    {
      id: 2,
      name: "Hypertrophy Template",
      description: "Focus on muscle growth with progressive overload",
      clientId: null,
      clientName: null,
      startDate: null,
      endDate: null,
      isTemplate: true,
      type: "template",
      status: null
    },
    {
      id: 3,
      name: "Strength Building Plan",
      description: "Heavy compound movements for overall strength",
      clientId: 2,
      clientName: "Michael Thompson",
      startDate: "2023-08-01T00:00:00Z",
      endDate: "2023-11-01T00:00:00Z",
      isTemplate: false,
      type: "assigned",
      status: "in_progress"
    },
    {
      id: 4,
      name: "HIIT Cardio Program",
      description: "High intensity interval training for cardiovascular fitness",
      clientId: null,
      clientName: null,
      startDate: null,
      endDate: null,
      isTemplate: true,
      type: "template",
      status: null
    }
  ];

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <>
      <PageHeader
        title="Workout Programs"
        description="Create and manage workout plans for your clients"
        actions={[
          {
            label: "Create Workout",
            icon: <FileText size={18} />,
            href: "/workouts/create",
            variant: "default"
          }
        ]}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Workouts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workouts</SelectItem>
                <SelectItem value="assigned">Assigned Plans</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sortBy === "name_asc"}
                  onCheckedChange={() => setSortBy("name_asc")}
                >
                  Name (A-Z)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "name_desc"}
                  onCheckedChange={() => setSortBy("name_desc")}
                >
                  Name (Z-A)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "date_desc"}
                  onCheckedChange={() => setSortBy("date_desc")}
                >
                  Newest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "date_asc"}
                  onCheckedChange={() => setSortBy("date_asc")}
                >
                  Oldest First
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Workouts Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading workouts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load workouts</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredWorkouts?.length > 0 ? filteredWorkouts : demoWorkouts).map((workout: any) => (
              <Card key={workout.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{workout.name}</CardTitle>
                    {workout.isTemplate && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full dark:bg-primary-900 dark:text-primary-300">
                        Template
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {workout.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workout.clientName && (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Assigned to: <span className="font-medium">{workout.clientName}</span></span>
                      </div>
                    )}
                    {workout.startDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{formatDate(workout.startDate)} - {formatDate(workout.endDate)}</span>
                      </div>
                    )}
                    {workout.status && (
                      <div className="flex items-center text-sm">
                        <DumbbellIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Status: <span className={`font-medium ${
                          workout.status === 'in_progress' ? 'text-primary-600 dark:text-primary-400' :
                          workout.status === 'completed' ? 'text-secondary-600 dark:text-secondary-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {workout.status === 'in_progress' ? 'In Progress' :
                           workout.status === 'completed' ? 'Completed' : 
                           'Not Started'}
                        </span></span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  {workout.isTemplate ? (
                    <Button variant="outline" size="sm" className="mr-2">
                      Use Template
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                  )}
                  <Link href={`/workouts/${workout.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      View <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            
            {filteredWorkouts?.length === 0 && searchQuery && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No workouts found matching "{searchQuery}"</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
