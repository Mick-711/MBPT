import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Sample data for the client list (will be replaced with API call in production)
const SAMPLE_CLIENTS = [
  {
    id: 1,
    fullName: "Mick Smith",
    email: "mick.711@hotmail.com",
    profileImage: null,
    joinedDate: "2023-08-15",
    subscription: "Premium",
    status: "active",
    progress: 76,
    trainer: "John Trainer",
    tags: ["weight loss", "strength"],
    nextSession: "2025-05-18T10:00:00",
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah.j@example.com",
    profileImage: null,
    joinedDate: "2024-01-22",
    subscription: "Standard",
    status: "active",
    progress: 42,
    trainer: "John Trainer",
    tags: ["endurance", "marathon"],
    nextSession: "2025-05-17T15:30:00",
  },
  {
    id: 3,
    fullName: "David Williams",
    email: "david.w@example.com",
    profileImage: null,
    joinedDate: "2024-03-10",
    subscription: "Premium",
    status: "inactive",
    progress: 19,
    trainer: "Emily Coach",
    tags: ["muscle gain", "bodybuilding"],
    nextSession: null,
  },
  {
    id: 4,
    fullName: "Jennifer Lee",
    email: "jen.lee@example.com",
    profileImage: null,
    joinedDate: "2023-11-05",
    subscription: "Premium",
    status: "active",
    progress: 88,
    trainer: "John Trainer",
    tags: ["weight loss", "nutrition"],
    nextSession: "2025-05-19T09:15:00",
  },
  {
    id: 5,
    fullName: "Michael Brown",
    email: "michael.b@example.com",
    profileImage: null,
    joinedDate: "2024-02-15",
    subscription: "Standard",
    status: "active",
    progress: 35,
    trainer: "Emily Coach",
    tags: ["rehab", "mobility"],
    nextSession: "2025-05-18T13:45:00",
  },
];

// Client status badge component
const ClientStatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    active: "bg-green-100 text-green-800 hover:bg-green-200",
    inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  };

  return (
    <Badge
      className={
        statusStyles[status as keyof typeof statusStyles] ||
        "bg-gray-100 text-gray-800"
      }
      variant="outline"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Progress bar component
const ProgressBar = ({ progress }: { progress: number }) => {
  const getProgressColor = (value: number) => {
    if (value < 30) return "bg-red-500";
    if (value < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${getProgressColor(progress)}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// Clients overview component
const ClientsOverview = ({ clientData }: { clientData: typeof SAMPLE_CLIENTS }) => {
  const activeClients = clientData.filter((client) => client.status === "active").length;
  const inactiveClients = clientData.filter((client) => client.status === "inactive").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientData.length}</div>
          <p className="text-xs text-muted-foreground">
            +{Math.floor(Math.random() * 5) + 1} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClients}</div>
          <p className="text-xs text-muted-foreground">
            {(activeClients / clientData.length * 100).toFixed(1)}% of total clients
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {clientData.filter(c => c.nextSession !== null).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Next 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientsListPage = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get clients from local storage
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Get clients from local storage, initialize with sample data if empty
      const storedClients = localStorage.getItem("fitTrainPro_clients");
      if (!storedClients) {
        localStorage.setItem("fitTrainPro_clients", JSON.stringify(SAMPLE_CLIENTS));
        return SAMPLE_CLIENTS;
      }
      return JSON.parse(storedClients);
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort clients
  const filteredClients = clients
    ? clients
        .filter((client) => {
          // Apply search filter
          const matchesSearch =
            client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());

          // Apply status filter
          const matchesStatus =
            statusFilter === "all" || client.status === statusFilter;

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          if (sortField === "fullName") {
            return sortDirection === "asc"
              ? a.fullName.localeCompare(b.fullName)
              : b.fullName.localeCompare(a.fullName);
          }
          if (sortField === "joinedDate") {
            return sortDirection === "asc"
              ? new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
              : new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
          }
          if (sortField === "progress") {
            return sortDirection === "asc"
              ? a.progress - b.progress
              : b.progress - a.progress;
          }
          return 0;
        })
    : [];

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button onClick={() => setLocation("/clients/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Client
        </Button>
      </div>

      {/* Overview cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ClientsOverview clientData={clients || []} />
      )}

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex w-full md:w-auto items-center space-x-2">
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[250px]"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-full md:w-auto items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("fullName")}
                >
                  Client
                  {getSortIcon("fullName")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("joinedDate")}
                >
                  Joined Date
                  {getSortIcon("joinedDate")}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("progress")}
                >
                  Progress
                  {getSortIcon("progress")}
                </div>
              </TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Next Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={client.profileImage || ""} alt={client.fullName} />
                        <AvatarFallback>
                          {client.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.fullName}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>{format(new Date(client.joinedDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProgressBar progress={client.progress} />
                      <span className="text-sm">{client.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{client.subscription}</TableCell>
                  <TableCell>
                    {client.nextSession
                      ? format(new Date(client.nextSession), "MMM d, h:mm a")
                      : "None scheduled"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setLocation(`/clients/${client.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Session</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() =>
                            window.confirm(
                              "Are you sure you want to delete this client? This action cannot be undone."
                            )
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientsListPage;