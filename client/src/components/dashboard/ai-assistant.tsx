import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Dumbbell, 
  ChefHat, 
  BarChart3 
} from "lucide-react";

export default function AIAssistant() {
  const [location, setLocation] = useLocation();

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold">AI Workout Assistant</h2>
        <span className="px-2 py-1 bg-white bg-opacity-20 rounded-md text-xs font-medium">Beta</span>
      </div>
      
      <p className="text-sm text-white text-opacity-90 mb-4">
        Generate personalized workout plans and nutrition guides based on client goals and preferences.
      </p>
      
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium text-white"
          onClick={() => handleNavigate("/workouts/create?ai=true")}
        >
          <div className="flex items-center">
            <Dumbbell size={16} className="mr-2" />
            <span>Generate new workout plan</span>
          </div>
          <ArrowRight size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium text-white"
          onClick={() => handleNavigate("/nutrition/create?ai=true")}
        >
          <div className="flex items-center">
            <ChefHat size={16} className="mr-2" />
            <span>Create nutrition guide</span>
          </div>
          <ArrowRight size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium text-white"
          onClick={() => handleNavigate("/clients/analysis")}
        >
          <div className="flex items-center">
            <BarChart3 size={16} className="mr-2" />
            <span>Analyze client progress</span>
          </div>
          <ArrowRight size={16} />
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-white text-opacity-70">
        Powered by advanced AI to help you create personalized plans in seconds.
      </div>
    </div>
  );
}
