import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from 'lucide-react';

// Activity form schema
const activitySchema = z.object({
  type: z.string({
    required_error: "Please select an activity type",
  }),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface AddActivityDialogProps {
  client: any;
  onSuccess?: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function AddActivityDialog({ 
  client, 
  onSuccess, 
  variant = "outline", 
  size = "sm" 
}: AddActivityDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form with default values
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
    },
  });

  // Add activity mutation
  const addActivity = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      // In a real app, this would call the API endpoint
      // For demo, we'll just simulate success
      console.log("Adding activity for client:", client.fullName, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Return the activity with current date
      return {
        ...data,
        date: format(new Date(), 'MMM dd, yyyy'),
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Activity recorded",
        description: `${data.title} has been added to ${client.fullName}'s activity log.`,
      });
      
      // Close dialog
      setOpen(false);
      form.reset();
      
      // Invalidate queries to refetch data
      if (client.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error recording activity",
        description: error.message || "An error occurred while adding the activity.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ActivityFormValues) => {
    addActivity.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Record Client Activity</DialogTitle>
          <DialogDescription>
            Add a new activity or progress note for {client.fullName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="workout">Workout</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Completed Leg Day, Hit Protein Goal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about this activity..."
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addActivity.isPending}>
                {addActivity.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}