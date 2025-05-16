import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, StickyNote } from 'lucide-react';

// Notes edit form schema
const notesEditSchema = z.object({
  notes: z.string().optional(),
});

type NotesEditFormValues = z.infer<typeof notesEditSchema>;

interface EditNotesDialogProps {
  client: any;
  onSuccess?: () => void;
}

export function EditNotesDialog({ client, onSuccess }: EditNotesDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form with existing notes
  const form = useForm<NotesEditFormValues>({
    resolver: zodResolver(notesEditSchema),
    defaultValues: {
      notes: client.notes || '',
    },
  });

  // Update notes mutation
  const updateNotes = useMutation({
    mutationFn: async (data: NotesEditFormValues) => {
      // In a real app, this would call the API endpoint
      // For demo, we'll just simulate success
      console.log("Updating client notes:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Return the updated client data
      return {
        ...client,
        notes: data.notes,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Notes updated",
        description: "Client notes have been updated successfully.",
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
        title: "Error updating notes",
        description: error.message || "An error occurred while updating the client notes.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: NotesEditFormValues) => {
    updateNotes.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <StickyNote className="mr-2 h-4 w-4" />
          Edit Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Client Notes</DialogTitle>
          <DialogDescription>
            Update notes about {client.fullName}'s progress, preferences, or specific requirements.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add personal notes, reminders, or important information about this client."
                      className="min-h-[200px]" 
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
              <Button type="submit" disabled={updateNotes.isPending}>
                {updateNotes.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}