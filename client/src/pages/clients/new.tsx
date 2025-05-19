import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PageHeader } from '@/components/page-header';
import { Link } from 'wouter';

// Define the form schema using Zod
const clientFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  height: z.string().optional(),
  weight: z.string().optional(),
  dateOfBirth: z.string().optional(),
  goals: z.string().optional(),
  healthInfo: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewClientPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Initialize form with default values
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      height: '',
      weight: '',
      dateOfBirth: '',
      goals: '',
      healthInfo: '',
      notes: '',
    },
  });

  // Set up the mutation for creating a client
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      // First create the user
      const userData = {
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        role: 'client',
      };

      const userResponse = await apiRequest('/api/users', 'POST', JSON.stringify(userData));

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const user = await userResponse.json();

      // Then create the client profile
      const clientData = {
        userId: user.id,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        dateOfBirth: data.dateOfBirth || null,
        goals: data.goals || null,
        healthInfo: data.healthInfo || null,
        notes: data.notes || null,
        joinedDate: new Date().toISOString(),
      };

      const clientResponse = await apiRequest('/api/clients', 'POST', JSON.stringify(clientData));

      if (!clientResponse.ok) {
        const error = await clientResponse.json();
        throw new Error(error.message || 'Failed to create client profile');
      }

      return await clientResponse.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainer/clients'] });
      toast({
        title: 'Success!',
        description: 'Client was successfully created.',
      });
      // Navigate to the new client's profile page
      navigate(`/clients/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: ClientFormValues) => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      createClientMutation.mutate(data);
    }
  };

  // Handle back button in multi-step form
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container p-6">
      <PageHeader 
        heading="Add New Client" 
        text="Create a new client account and profile."
      />

      <Link href="/clients">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Create the client's account details. They'll use these credentials to log in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Input placeholder="johndoe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="•••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Next Step</Button>
              </CardFooter>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Add details about the client's physical stats and goals. These are optional and can be updated later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input placeholder="178" type="number" {...field} />
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
                          <Input placeholder="75" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          placeholder="E.g., lose weight, build muscle, improve endurance" 
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
                          placeholder="Any medical conditions, injuries, or allergies" 
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any other relevant information about this client" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Creating...
                    </>
                  ) : (
                    'Create Client'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}