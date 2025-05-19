// client/src/components/nutrition/FoodDatabase.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Import food categories
const foodCategoryEnum = {
  enumValues: [
    'protein',
    'carbs',
    'fat',
    'vegetable',
    'fruit',
    'dairy',
    'beverage',
    'snack',
    'supplement',
    'other'
  ]
};

const categories = ['all', ...(Object.values(foodCategoryEnum.enumValues) as string[])];

export function FoodDatabase() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['foods', { category, search, page }],
    queryFn: async () =>
      fetch(
        `/api/nutrition/foods?` +
        new URLSearchParams({
          category,
          search,
          page: page.toString(),
          pageSize: '20',
          sortBy: 'name',
          sortDir: 'asc',
        })
      )
      .then((r) => r.json()),
    staleTime: 30000,
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500">Failed to load foods.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="flex-1 min-w-[200px]"
        />
        
        <Button onClick={() => setPage(1)}>Apply</Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Calories</TableHead>
              <TableHead className="text-right">Protein (g)</TableHead>
              <TableHead className="text-right">Carbs (g)</TableHead>
              <TableHead className="text-right">Fat (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>{f.category}</TableCell>
                <TableCell className="text-right">{f.calories.toFixed(1)}</TableCell>
                <TableCell className="text-right">{f.protein.toFixed(1)}</TableCell>
                <TableCell className="text-right">{f.carbs.toFixed(1)}</TableCell>
                <TableCell className="text-right">{f.fat.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span>Page {page} of {Math.ceil(data?.total / data?.pageSize) || 1}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * data?.pageSize >= data?.total}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}