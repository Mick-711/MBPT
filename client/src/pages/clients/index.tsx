import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserPlus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

interface ClientData {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    username: string;
  };
  height: number | null;
  weight: number | null;
  goals: string | null;
  joinedDate: string;
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<{
    field: string;
    value: string;
  } | null>(null);

  // Fetch clients data
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/trainer/clients'],
    select: (data) => data as ClientData[],
  });

  // Filter clients based on search query and filters
  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      !searchQuery ||
      client.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      !filterCriteria ||
      (filterCriteria.field === 'goals' &&
        client.goals?.toLowerCase().includes(filterCriteria.value.toLowerCase()));

    return matchesSearch && matchesFilter;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container p-6">
      <PageHeader
        heading="Clients"
        text="Manage your client roster and profiles."
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <Link href="/clients/new">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </PageHeader>

      {isLoading ? (
        <ClientsTableSkeleton />
      ) : filteredClients && filteredClients.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clients/${client.id}`} className="hover:underline">
                        {client.user.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>{client.user.email}</TableCell>
                    <TableCell>{client.height ? `${client.height} cm` : '-'}</TableCell>
                    <TableCell>{client.weight ? `${client.weight} kg` : '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {client.goals || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(client.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Clients Found</CardTitle>
            <CardDescription>
              {searchQuery || filterCriteria
                ? 'No clients match your search criteria.'
                : 'You have no clients yet. Click "Add Client" to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/clients/new">
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Your First Client
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClientsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-60" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-9 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}