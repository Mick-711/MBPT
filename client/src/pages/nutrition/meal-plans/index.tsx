import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Pizza,
  Calendar,
  Plus,
  Search,
  FilterX,
  ChevronLeft,
  Pencil,
  Copy,
  Trash2,
  Users,
  ChevronDown,
  Check,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { 
  getMealPlansFromStorage,
  initializeNutritionStorage,
  MealPlanData
} from '@/lib/nutritionHelpers';

export default function MealPlansPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  
  // Initialize nutrition storage if empty
  useEffect(() => {
    initializeNutritionStorage();
  }, []);
  
  // Fetch meal plans
  const { data: mealPlans, isLoading, refetch } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => getMealPlansFromStorage()
  });
  
  // Filter meal plans based on search term and filter type
  const filteredPlans = mealPlans?.filter(plan => {
    const matchesSearch = 
      searchTerm === '' || 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'templates' && plan.isTemplate) || 
      (filterType === 'assigned' && !plan.isTemplate);
    
    return matchesSearch && matchesType;
  }) || [];
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };
  
  // Handle delete plan
  const handleDeletePlan = (planId: number) => {
    setPlanToDelete(planId);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete plan
  const confirmDeletePlan = () => {
    if (planToDelete === null) return;
    
    // In a real app, we would delete from the server
    // For now, we'll just show a toast and close the dialog
    toast({
      title: "Meal Plan Deleted",
      description: "The meal plan has been successfully deleted.",
    });
    
    setIsDeleteDialogOpen(false);
    setPlanToDelete(null);
    
    // Refetch meal plans
    refetch();
  };
  
  // JSX for the filters section
  const filtersSection = (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
      <div className="flex-1">
        <div className="text-sm font-medium mb-2">Search Meal Plans</div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="w-full md:w-[200px]">
        <div className="text-sm font-medium mb-2">Plan Type</div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="templates">Templates</SelectItem>
            <SelectItem value="assigned">Assigned Plans</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        {(searchTerm || filterType !== 'all') && (
          <Button variant="outline" onClick={clearFilters}>
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="ml-auto">
        <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Meal Plan
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/nutrition')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Nutrition
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Plans</h1>
          <p className="text-muted-foreground">
            Create and manage meal plans for your clients
          </p>
        </div>
      </div>
      
      {filtersSection}
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <Card key={plan.id} className="hover:bg-muted/5 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.description && (
                      <CardDescription>{plan.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant={plan.isTemplate ? 'outline' : 'default'} className="ml-2">
                    {plan.isTemplate ? 'Template' : 'Client Plan'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Daily Calories</p>
                    <p className="text-2xl font-bold">{plan.dailyCalories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Protein</p>
                    <p className="text-2xl font-bold">{plan.dailyProtein}g</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((plan.dailyProtein * 4 / plan.dailyCalories) * 100)}% of calories
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Carbs</p>
                    <p className="text-2xl font-bold">{plan.dailyCarbs}g</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((plan.dailyCarbs * 4 / plan.dailyCalories) * 100)}% of calories
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Fat</p>
                    <p className="text-2xl font-bold">{plan.dailyFat}g</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((plan.dailyFat * 9 / plan.dailyCalories) * 100)}% of calories
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{plan.days.length} day plan</span>
                  </div>
                  
                  {!plan.isTemplate && plan.clientId && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Assigned to Client #{plan.clientId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/nutrition/meal-plans/${plan.id}`)}
                  >
                    View
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/nutrition/meal-plans/${plan.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => navigate(`/nutrition/meal-plans/${plan.id}/copy`)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      
                      {plan.isTemplate && (
                        <DropdownMenuItem
                          onClick={() => navigate(`/nutrition/meal-plans/${plan.id}/assign`)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Assign to Client
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Pizza className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Meal Plans Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' 
                ? "No meal plans match your search filters. Try adjusting your search criteria."
                : "You haven't created any meal plans yet. Create your first meal plan to get started."}
            </p>
            {searchTerm || filterType !== 'all' ? (
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Meal Plan
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meal Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meal plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}