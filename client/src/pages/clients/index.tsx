import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Dumbbell,
  Scale,
  Calendar,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/page-header';

// Mock client data
const mockClients = [
  {
    id: 1,
    fullName: 'Mick Smith',
    email: 'mick.711@hotmail.com',
    status: 'Active',
    weight: '78.6 kg',
    program: 'Weight Loss',
    progress: '75%',
    lastSession: '3 days ago',
    nextSession: 'May 18, 2025'
  },
  {
    id: 2,
    fullName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    status: 'Active',
    weight: '65.2 kg',
    program: 'Strength',
    progress: '82%',
    lastSession: '1 day ago',
    nextSession: 'May 16, 2025'
  },
  {
    id: 3,
    fullName: 'James Wilson',
    email: 'jwilson@example.com',
    status: 'On Hold',
    weight: '92.4 kg',
    program: 'Conditioning',
    progress: '45%',
    lastSession: '7 days ago',
    nextSession: 'Not Scheduled'
  },
  {
    id: 4,
    fullName: 'Emma Roberts',
    email: 'emma.r@example.com',
    status: 'Active',
    weight: '58.7 kg',
    program: 'Endurance',
    progress: '90%',
    lastSession: '2 days ago',
    nextSession: 'May 17, 2025'
  }
];

export default function ClientsIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [, navigate] = useLocation();

  // Filter clients based on search term and status
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = 
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage your clients, review their progress, and create new programs."
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
        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  <span>Status: {statusFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('All')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('On Hold')}>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Inactive')}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Link href="/clients/new">
                <span className="flex items-center gap-2">
                  <UserPlus size={16} />
                  Add Client
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Client list */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-white dark:bg-gray-800">
              <p className="text-muted-foreground mb-2">No clients found</p>
              <Button>
                <Link href="/clients/new">
                  <span className="flex items-center gap-2">
                    <UserPlus size={16} />
                    Add New Client
                  </span>
                </Link>
              </Button>
            </div>
          ) : (
            filteredClients.map(client => (
              <Card key={client.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/clients/${client.id}`} className="block">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center p-4 md:p-6 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium mr-4">
                          {client.fullName.split(' ').map(name => name[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{client.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <Badge 
                          className={
                            client.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            client.status === 'On Hold' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }
                        >
                          {client.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 border-t md:border-t-0 md:border-l bg-muted/10">
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 border-r">
                          <div className="flex items-center text-muted-foreground mb-1">
                            <Scale size={14} className="mr-1" />
                            <span className="text-xs">Weight</span>
                          </div>
                          <span className="font-medium text-sm">{client.weight}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 border-r">
                          <div className="flex items-center text-muted-foreground mb-1">
                            <Dumbbell size={14} className="mr-1" />
                            <span className="text-xs">Program</span>
                          </div>
                          <span className="font-medium text-sm">{client.program}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 border-r">
                          <div className="flex items-center text-muted-foreground mb-1">
                            <Calendar size={14} className="mr-1" />
                            <span className="text-xs">Next Session</span>
                          </div>
                          <span className="font-medium text-sm">{client.nextSession}</span>
                        </div>
                        
                        <div className="flex items-center justify-center p-4 md:p-6">
                          <ChevronRight size={20} className="text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}