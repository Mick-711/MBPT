import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const CATEGORIES = [
  'all',
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
];

const ITEMS_PER_PAGE = 10;

/**
 * FoodDatabase component displaying a searchable, filterable list of foods
 * with nutrition information from our database
 */
export function FoodDatabase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  
  // Fetch foods with search and category filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/nutrition/foods', search, category, page],
    queryFn: async () => {
      let url = `/api/nutrition/foods?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }
      
      return response.json();
    }
  });
  
  const foods = data?.foods || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  function handlePrevPage() {
    setPage((p) => Math.max(1, p - 1));
  }
  
  function handleNextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }
  
  function getCategoryColor(category: string) {
    switch (category) {
      case 'protein': return 'bg-red-100 text-red-800';
      case 'carbs': return 'bg-amber-100 text-amber-800';
      case 'fat': return 'bg-yellow-100 text-yellow-800';
      case 'vegetable': return 'bg-green-100 text-green-800';
      case 'fruit': return 'bg-emerald-100 text-emerald-800';
      case 'dairy': return 'bg-blue-100 text-blue-800';
      case 'beverage': return 'bg-cyan-100 text-cyan-800';
      case 'snack': return 'bg-purple-100 text-purple-800';
      case 'supplement': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Food Database</CardTitle>
        <CardDescription>
          Search our comprehensive database of {totalItems} foods with detailed nutritional information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search-foods">Search</Label>
            <Input
              id="search-foods"
              placeholder="Search foods..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="mt-1"
            />
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="category-filter">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <SelectTrigger id="category-filter" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Error loading foods. Please try again.</p>
        ) : foods.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            No foods found. Try adjusting your search or filters.
          </p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="text-right">Protein</TableHead>
                  <TableHead className="text-right">Carbs</TableHead>
                  <TableHead className="text-right">Fat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foods.map((food: any) => (
                  <TableRow key={food.id}>
                    <TableCell className="font-medium">{food.name}</TableCell>
                    <TableCell>
                      <Badge className={`font-normal ${getCategoryColor(food.category)}`}>
                        {food.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{food.calories}</TableCell>
                    <TableCell className="text-right">{food.protein}g</TableCell>
                    <TableCell className="text-right">{food.carbs}g</TableCell>
                    <TableCell className="text-right">{food.fat}g</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={handlePrevPage} 
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
                
                if (pageNumber <= 0 || pageNumber > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === page}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={handleNextPage} 
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}