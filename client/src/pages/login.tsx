import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Dumbbell, UserCog } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [location, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"client" | "trainer">("client");

  // Define form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: userRole === "client" ? "mick.711@hotmail.com" : "michaelbach711@gmail.com",
      password: "testing123",
    },
  });

  // Handle changing demo role
  const handleRoleChange = (role: "client" | "trainer") => {
    setUserRole(role);
    form.setValue("email", role === "client" ? "mick.711@hotmail.com" : "michaelbach711@gmail.com");
    form.setValue("password", "testing123");
  };

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError("");
    
    try {
      await login(values.email, values.password);
      
      // Force redirection after successful login
      if (userRole === "client") {
        window.location.href = "/mobile/client/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white h-6 w-6"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              FitCoach<span className="text-primary">Pro</span>
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Tabs 
                defaultValue="client" 
                value={userRole} 
                onValueChange={(value) => handleRoleChange(value as "client" | "trainer")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full mb-2">
                  <TabsTrigger value="client" className="flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Client Demo
                  </TabsTrigger>
                  <TabsTrigger value="trainer" className="flex items-center justify-center">
                    <UserCog className="w-4 h-4 mr-2" />
                    Trainer Demo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Select a demo account to see different views
              </p>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
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
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${userRole === "client" ? "Client" : "Trainer"}`
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Demo accounts pre-filled with testing credentials
                </p>
              </div>
              <div>
                Don't have an account?{" "}
                <Link href="/register">
                  <a className="font-medium text-primary hover:underline">
                    Sign up
                  </a>
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
