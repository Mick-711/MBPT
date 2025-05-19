import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Step 1: Account Information Form Schema
const accountFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be less than 20 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// Step 2: Profile Information Form Schema
const profileFormSchema = z.object({
  height: z.coerce.number().min(0).max(300).optional().nullable(),
  weight: z.coerce.number().min(0).max(500).optional().nullable(),
  goals: z.string().max(500, 'Goals must be less than 500 characters.').optional().nullable(),
  healthInfo: z.string().max(1000, 'Health information must be less than 1000 characters.').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters.').optional().nullable(),
});

export default function NewClientPage() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Step 1: Account Information Form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
    },
  });

  // Step 2: Profile Information Form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      height: null,
      weight: null,
      goals: null,
      healthInfo: null,
      notes: null,
    },
  });

  // Create user mutation (Step 1)
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accountFormSchema>) => {
      const userData = {
        ...data,
        role: 'client', // Set role to client by default
      };
      
      return apiRequest('/api/users', {
        method: 'POST',
        data: userData,
      });
    },
    onSuccess: (data) => {
      setUserId(data.id);
      setStep(2); // Move to next step
      toast({
        title: 'Account created',
        description: 'Client account information saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client account.',
        variant: 'destructive',
      });
    },
  });

  // Create client profile mutation (Step 2)
  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      if (!userId) throw new Error('User ID is missing');
      
      const profileData = {
        ...data,
        userId,
        joinedDate: new Date(),
      };
      
      return apiRequest('/api/clients', {
        method: 'POST',
        data: profileData,
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Client created',
        description: 'New client added successfully.',
      });
      navigate(`/clients/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client profile.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onSubmitAccountForm = (data: z.infer<typeof accountFormSchema>) => {
    createUserMutation.mutate(data);
  };

  const onSubmitProfileForm = (data: z.infer<typeof profileFormSchema>) => {
    createProfileMutation.mutate(data);
  };

  return (
    <div className="container p-6">
      <div className="mb-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <PageHeader
        heading="Add New Client"
        text="Create a new client account and profile."
      />

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {step === 1 ? 'Step 1: Account Information' : 'Step 2: Profile Information'}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Step {step} of 2
            </div>
          </div>
          <CardDescription>
            {step === 1
              ? 'Enter the client\'s basic account information.'
              : 'Enter additional profile details for the client.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(onSubmitAccountForm)} className="space-y-6">
                <FormField
                  control={accountForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Client's full name as it will appear in the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Client's email for login and communications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={accountForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Client's unique username for logging in.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Temporary password (client can change later).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="gap-2"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Next Step
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfileForm)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="175"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={e => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Client's height in centimeters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="70"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={e => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Client's weight in kilograms.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Build muscle, lose weight, improve endurance..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Client's fitness and health goals.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="healthInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any health conditions, restrictions, or important medical information..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Important health information and restrictions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes or information about the client..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Any other relevant information about the client.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back to Account Info
                  </Button>
                  <Button 
                    type="submit" 
                    className="gap-2"
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Client...
                      </>
                    ) : (
                      'Create Client'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}