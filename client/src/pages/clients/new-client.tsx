import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';

// Create a schema for client registration
const clientSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  height: z.string().refine(val => !isNaN(Number(val)), { message: "Height must be a number" }).optional(),
  weight: z.string().refine(val => !isNaN(Number(val)), { message: "Weight must be a number" }).optional(),
  dateOfBirth: z.date().optional(),
  goals: z.string().optional(),
  healthInfo: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewClientPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      height: "",
      weight: "",
      goals: "",
      healthInfo: "",
      notes: "",
    },
  });

  // Submit handler
  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    try {
      setIsSubmitting(true);
      
      // For demo purposes, we're simulating the API call
      // In a real application, this would be connected to the backend
      
      // Simulated successful client creation
      // In this simulation, we're adding a client similar to our sample data for Mick Smith
      
      setTimeout(() => {
        // Show success toast and navigate
        toast({
          title: "Client created successfully",
          description: `${data.fullName} has been added to your client list.`,
        });
  
        // Navigate to client list
        setLocation("/clients");
        setIsSubmitting(false);
      }, 1000);
      
      // In a real implementation, we would do something like this:
      /*
      // Generate a random password (will be changed on first login)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Prepare user data
      const userData = {
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: tempPassword,
        role: "client",
      };

      // Create user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }

      const newUser = await userResponse.json();

      // Prepare client profile data
      const clientData = {
        userId: newUser.id,
        trainerId: 1, // Current trainer ID
        height: data.height ? parseInt(data.height) : null,
        weight: data.weight ? parseInt(data.weight) : null,
        dateOfBirth: data.dateOfBirth,
        goals: data.goals,
        healthInfo: data.healthInfo,
        notes: data.notes,
      };

      // Create client profile
      const profileResponse = await fetch("/api/client-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      // Create activity for the new client
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newUser.id,
          type: "onboarding",
          title: "Client onboarded",
          description: `${data.fullName} has been added as a new client.`,
        }),
      });
      */
      
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error creating client:", error);
      toast({
        title: "Error creating client",
        description: "There was an error adding the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
          <p className="text-muted-foreground">
            Fill out the form below to add a new client to your roster.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/clients")}>
          Cancel
        </Button>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Enter the basic details for your new client. You can add more information later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Input type="email" placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          The client will use this to log in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Physical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="175" {...field} />
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
                          <Input type="number" placeholder="70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What are the client's fitness goals?"
                          className="min-h-[100px]"
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
                          placeholder="Any important health information, injuries, conditions, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other notes about this client"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0 pb-0">
                <div className="w-full flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => navigate("/clients")}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Client
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}