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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, Loader2, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Session form schema
const sessionSchema = z.object({
  sessionType: z.string({
    required_error: "Please select a session type",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface ScheduleSessionDialogProps {
  client: any;
  onSuccess?: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function ScheduleSessionDialog({ 
  client, 
  onSuccess, 
  variant = "default", 
  size = "default" 
}: ScheduleSessionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get tomorrow's date for default value
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Define form with default values
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      sessionType: "",
      date: tomorrow,
      time: "09:00",
      notes: "",
    },
  });

  // Schedule session mutation
  const scheduleSession = useMutation({
    mutationFn: async (data: SessionFormValues) => {
      // In a real app, this would call the API endpoint
      // For demo, we'll just simulate success
      console.log("Scheduling session for client:", client.fullName, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Return the scheduled session with formatted date
      return {
        title: data.sessionType,
        date: format(data.date, 'MMM dd, yyyy'),
        time: data.time,
        notes: data.notes,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Session scheduled",
        description: `${data.title} has been scheduled for ${data.date} at ${data.time}.`,
      });
      
      // Close dialog
      setOpen(false);
      form.reset();
      
      // Invalidate queries to refetch data
      if (client.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error scheduling session",
        description: error.message || "An error occurred while scheduling the session.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SessionFormValues) => {
    scheduleSession.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Schedule a Session</DialogTitle>
          <DialogDescription>
            Schedule a new training session or assessment with {client.fullName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="One-on-One Training">One-on-One Training</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Fitness Test">Fitness Test</SelectItem>
                      <SelectItem value="Nutrition Consultation">Nutrition Consultation</SelectItem>
                      <SelectItem value="Progress Review">Progress Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Session details, goals, or special instructions..."
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
              <Button type="submit" disabled={scheduleSession.isPending}>
                {scheduleSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Session"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}