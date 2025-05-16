import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from 'lucide-react';

// Client edit form schema
const clientEditSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  height: z.string().optional(),
  weight: z.string().optional(),
  goals: z.string().optional(),
  healthInfo: z.string().optional(),
});

type ClientEditFormValues = z.infer<typeof clientEditSchema>;

interface EditProfileDialogProps {
  client: any;
  onSuccess?: () => void;
}

export function EditProfileDialog({ client, onSuccess }: EditProfileDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form with existing client values
  const form = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema),
    defaultValues: {
      fullName: client.fullName || '',
      email: client.email || '',
      height: client.height ? client.height.toString() : '',
      weight: client.weight ? client.weight.toString() : '',
      goals: client.goals || '',
      healthInfo: client.healthInfo || '',
    },
  });

  // Update client mutation
  const updateClient = useMutation({
    mutationFn: async (data: ClientEditFormValues) => {
      // In a real app, this would call the API endpoint
      // For demo, we'll just simulate success
      console.log("Updating client data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return the updated client data
      return {
        ...client,
        ...data,
        height: data.height ? parseInt(data.height) : client.height,
        weight: data.weight ? parseFloat(data.weight) : client.weight,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Client profile has been updated successfully.",
      });
      
      // Close dialog
      setOpen(false);
      
      // Invalidate queries to refetch data
      if (client.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating the client profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ClientEditFormValues) => {
    updateClient.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Client Profile</DialogTitle>
          <DialogDescription>
            Update client information and preferences.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input placeholder="175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input placeholder="70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Goals</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Weight loss, muscle gain, improve endurance, etc."
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="healthInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any health conditions, injuries, or relevant medical history."
                      className="min-h-[80px]" 
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
              <Button type="submit" disabled={updateClient.isPending}>
                {updateClient.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}