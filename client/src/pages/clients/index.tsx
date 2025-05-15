import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Search, 
  Filter,
  Loader2
} from "lucide-react";
import ClientCard from "@/components/clients/client-card";
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

export default function ClientsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");

  // Fetch clients
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['/api/trainer/clients', statusFilter, sortBy],
    queryFn: async ({ queryKey }) => {
      const [url, status, sort] = queryKey;
      const params = new URLSearchParams();
      
      if (status !== 'all') {
        params.append('status', status as string);
      }
      
      if (sort) {
        params.append('sort', sort as string);
      }
      
      const queryUrl = `${url}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(queryUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      return response.json();
    }
  });

  // Filter clients by search query
  const filteredClients = clients?.filter((client: any) => {
    if (!searchQuery.trim()) return true;
    
    const fullName = client.user.fullName.toLowerCase();
    const email = client.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  // Demo clients for initial implementation
  const demoClients = [
    {
      id: 1,
      userId: 101,
      fullName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      program: "Weight Loss Program",
      startDate: "2023-07-15",
      lastActivity: "Today, 9:32 AM",
      status: "active",
      goals: "Lose 15lbs and improve overall fitness"
    },
    {
      id: 2,
      userId: 102,
      fullName: "Michael Thompson",
      email: "michael.thompson@example.com",
      program: "Muscle Building",
      startDate: "2023-08-03",
      lastActivity: "Today, 10:15 AM",
      status: "active",
      goals: "Gain muscle mass and strength"
    },
    {
      id: 3,
      userId: 103,
      fullName: "Emma Williams",
      email: "emma.williams@example.com",
      program: "General Fitness",
      startDate: "2023-06-22",
      lastActivity: "Yesterday, 4:45 PM",
      status: "active",
      goals: "Improve endurance and flexibility"
    },
    {
      id: 4,
      userId: 104,
      fullName: "Jason Lee",
      email: "jason.lee@example.com",
      program: "Athletic Performance",
      startDate: "2023-09-12",
      lastActivity: "2 days ago",
      status: "pending",
      goals: "Improve sprint speed and agility"
    }
  ];

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage your clients and their fitness programs"
        actions={[
          {
            label: "Add Client",
            icon: <UserPlus size={18} />,
            href: "/clients/new",
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
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  checked={sortBy === "recent"}
                  onCheckedChange={() => setSortBy("recent")}
                >
                  Recently Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "newest"}
                  onCheckedChange={() => setSortBy("newest")}
                >
                  Newest First
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load clients</p>
            <Button variant="outline">Retry</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredClients?.length > 0 ? filteredClients : demoClients).map((client: any) => (
              <ClientCard key={client.id} client={client} />
            ))}
            
            {filteredClients?.length === 0 && searchQuery && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No clients found matching "{searchQuery}"</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
