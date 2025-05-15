import PageHeader from "@/components/layout/page-header";
import WorkoutForm from "@/components/workouts/workout-form";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function CreateWorkout() {
  const [location] = useLocation();
  
  // Extract query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const clientId = params.get('clientId');
  const isAIAssisted = params.get('ai') === 'true';
  
  // Initial data with client ID if provided
  const initialData = clientId ? {
    clientId: parseInt(clientId),
    trainerId: 0, // Will be set from auth in the form
    name: '',
    description: '',
    isTemplate: false,
    workouts: [
      {
        name: 'Day 1 Workout',
        description: '',
        day: 1,
        exercises: []
      }
    ]
  } : undefined;

  return (
    <>
      <PageHeader
        title={isAIAssisted ? "AI-Assisted Workout Creation" : "Create Workout Plan"}
        description={isAIAssisted 
          ? "Generate a customized workout plan using AI based on client profile and goals" 
          : "Design a comprehensive workout plan for your client"
        }
        actions={[
          {
            label: "Back to Workouts",
            icon: <ChevronLeft size={18} />,
            href: "/workouts",
            variant: "outline"
          }
        ]}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
        <WorkoutForm isAIAssisted={isAIAssisted} initialData={initialData} />
      </main>
    </>
  );
}
