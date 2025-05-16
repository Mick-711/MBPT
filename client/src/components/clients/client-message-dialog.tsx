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
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from 'lucide-react';

// Message form schema
const messageSchema = z.object({
  subject: z.string().min(2, { message: "Subject must be at least 2 characters" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters" }),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ClientMessageDialogProps {
  client: any;
  onSuccess?: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function ClientMessageDialog({ 
  client, 
  onSuccess,
  variant = "outline",
  size = "sm"
}: ClientMessageDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form with default values
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      // In a real app, this would call the API endpoint
      // For demo, we'll just simulate success
      console.log("Sending message to client:", client.fullName, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Return the message with current date
      return {
        ...data,
        date: new Date().toISOString(),
        sender: "You",
        recipient: client.fullName,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${client.fullName}.`,
      });
      
      // Close dialog
      setOpen(false);
      form.reset();
      
      // Invalidate queries to refetch data
      if (client.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/messages/${client.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "An error occurred while sending the message.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MessageFormValues) => {
    sendMessage.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Mail className="mr-2 h-4 w-4" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Message to {client.fullName}</DialogTitle>
          <DialogDescription>
            Send a message directly to your client. They'll be notified immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Message subject..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..."
                      className="min-h-[150px]" 
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
              <Button type="submit" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}