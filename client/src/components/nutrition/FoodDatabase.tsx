// client/src/components/nutrition/FoodDatabase.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, FileSpreadsheet, Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Food categories enum - same as in the database
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

// Component to show food database with import functionality
export function FoodDatabase() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch foods with filtering and pagination
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

  // Import job state
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    validCount?: number;
    insertedCount?: number;
    skippedCount?: number;
    errorCount?: number;
    errorMessage?: string;
  } | null>(null);

  // Check import job status
  const importJobQuery = useQuery({
    queryKey: ['importJob', importJobId],
    queryFn: async () => {
      if (!importJobId) return null;
      const response = await fetch(`/api/nutrition/foods/import/${importJobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch import status');
      }
      return response.json();
    },
    enabled: !!importJobId && (importStatus?.status === 'pending' || importStatus?.status === 'processing'),
    refetchInterval: 1000, // Poll every second while job is active
  });
  
  // Handle successful response using useEffect
  useEffect(() => {
    if (importJobQuery.data) {
      setImportStatus(importJobQuery.data);
      if (importJobQuery.data.status === 'completed') {
        toast({
          title: "Import completed",
          description: `Successfully imported ${importJobQuery.data.insertedCount} food items.`,
        });
        queryClient.invalidateQueries({ queryKey: ['foods'] });
      } else if (importJobQuery.data.status === 'failed') {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: importJobQuery.data.errorMessage || "Unknown error occurred",
        });
      }
    }
  }, [importJobQuery.data, queryClient, toast]);

  // Mutation to upload file for import
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/nutrition/foods/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setImportJobId(data.jobId);
      setImportStatus({
        status: 'pending',
        progress: 0,
      });
      toast({
        title: "Upload successful",
        description: "Food data is being processed...",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
      });
      return;
    }
    
    importMutation.mutate(file);
  };

  // Handle search submission
  const handleSearch = () => {
    setPage(1); // Reset to first page when applying new filters
  };

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-600 flex items-center gap-2">
      <AlertCircle size={20} />
      <span>Failed to load foods. Please try refreshing the page.</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 flex-1">
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Import Foods Button */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <FileSpreadsheet size={18} />
              <span>Import Foods</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Foods from Excel</DialogTitle>
              <DialogDescription>
                Upload an Excel file containing food data. The file should have columns for name, category, serving size, calories, protein, carbs, fat, etc.
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-4">
              {!importJobId && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Excel (.xlsx, .xls) or CSV files only</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importMutation.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
              
              {importJobId && importStatus && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Import Status</CardTitle>
                    <div className="flex items-center gap-2">
                      {importStatus.status === 'pending' && (
                        <Badge variant="outline" className="bg-blue-50">Pending</Badge>
                      )}
                      {importStatus.status === 'processing' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Processing</Badge>
                      )}
                      {importStatus.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-800">Completed</Badge>
                      )}
                      {importStatus.status === 'failed' && (
                        <Badge variant="outline" className="bg-red-50 text-red-800">Failed</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(importStatus.status === 'pending' || importStatus.status === 'processing') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>{importStatus.progress}%</span>
                        </div>
                        <Progress value={importStatus.progress} />
                      </div>
                    )}
                    
                    {importStatus.status === 'completed' && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          <span>Import completed successfully</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          <div>Valid items:</div>
                          <div className="font-medium">{importStatus.validCount}</div>
                          <div>Inserted:</div>
                          <div className="font-medium">{importStatus.insertedCount}</div>
                          <div>Skipped (duplicates):</div>
                          <div className="font-medium">{importStatus.skippedCount}</div>
                          <div>Errors:</div>
                          <div className="font-medium">{importStatus.errorCount}</div>
                        </div>
                      </div>
                    )}
                    
                    {importStatus.status === 'failed' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={16} />
                        <span>{importStatus.errorMessage || 'Unknown error occurred'}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {importStatus.status === 'completed' || importStatus.status === 'failed' ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setImportJobId(null);
                          setImportStatus(null);
                        }}
                        className="w-full"
                      >
                        Start New Import
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info size={14} />
                        <span>This process may take a few minutes for large files</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsImportDialogOpen(false)}
              >
                {importJobId ? 'Close' : 'Cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Results count */}
      {data && (
        <div className="text-sm text-muted-foreground">
          {data.total === 0 ? (
            <span>No foods found matching your criteria.</span>
          ) : (
            <span>Showing {((page - 1) * data.pageSize) + 1} to {Math.min(page * data.pageSize, data.total)} of {data.total} foods</span>
          )}
        </div>
      )}

      {/* Food table */}
      {data?.items?.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Serving</TableHead>
                <TableHead className="text-right">Calories</TableHead>
                <TableHead className="text-right">Protein (g)</TableHead>
                <TableHead className="text-right">Carbs (g)</TableHead>
                <TableHead className="text-right">Fat (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((food: any) => (
                <TableRow key={food.id}>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {food.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{food.servingSize} {food.servingUnit}</TableCell>
                  <TableCell className="text-right">{food.calories}</TableCell>
                  <TableCell className="text-right">{food.protein?.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{food.carbs?.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{food.fat?.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <div className="text-muted-foreground">No foods found</div>
        </div>
      )}

      {/* Pagination */}
      {data?.total > 0 && (
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span>Page {page} of {Math.ceil(data.total / data.pageSize) || 1}</span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * data.pageSize >= data.total}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}