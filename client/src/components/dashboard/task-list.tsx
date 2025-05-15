import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low';
  clientId?: number;
  clientName?: string;
}

interface TaskItemProps {
  task: Task;
  onComplete: (id: number, completed: boolean) => void;
}

const TaskItem = ({ task, onComplete }: TaskItemProps) => {
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive dark:bg-destructive/30';
      case 'medium':
        return 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return `Due today at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return `Due tomorrow at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `Due ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const formatCompletedDate = (date?: string) => {
    if (!date) return '';
    
    const completedDate = new Date(date);
    return `Completed at ${completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
      <Checkbox 
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={(checked) => onComplete(task.id, Boolean(checked))}
        className="mt-0.5"
      />
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
          {task.title}
        </p>
        <p className={`text-xs mt-1 ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {task.completed ? formatCompletedDate(task.completedAt) : formatDueDate(task.dueDate)}
        </p>
      </div>
      <div className="flex items-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          task.completed 
            ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            : getPriorityBadgeClass(task.priority)
        }`}>
          {task.completed ? 'Done' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default function TaskList() {
  const { toast } = useToast();
  
  // Fetch tasks
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0], {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      if (completed) {
        return await apiRequest('PUT', `/api/tasks/${id}/complete`, {});
      } else {
        return await apiRequest('PUT', `/api/tasks/${id}`, { completed: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    }
  });

  // Handler for completing tasks
  const handleCompleteTask = (id: number, completed: boolean) => {
    completeTaskMutation.mutate({ id, completed });
  };

  // Default tasks for initial implementation
  const defaultTasks: Task[] = [
    { 
      id: 1, 
      title: "Review Sarah's nutrition plan", 
      dueDate: new Date().toISOString(), 
      completed: false, 
      priority: 'high' 
    },
    { 
      id: 2, 
      title: "Prepare new workout plan for Mike", 
      dueDate: new Date().toISOString(), 
      completed: false, 
      priority: 'medium' 
    },
    { 
      id: 3, 
      title: "Send follow-up to Jason", 
      dueDate: new Date().toISOString(), 
      completed: false, 
      priority: 'low' 
    },
    { 
      id: 4, 
      title: "Update client progress reports", 
      dueDate: new Date().toISOString(), 
      completed: true, 
      completedAt: new Date().toISOString(), 
      priority: 'medium' 
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">
            Tasks for Today
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-600 hover:text-primary-800 hover:bg-primary-50"
          >
            <Plus size={18} />
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
              ))}
            </>
          ) : error ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Failed to load tasks</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : (
            <>
              {(tasks?.length > 0 ? tasks : defaultTasks).map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onComplete={handleCompleteTask} 
                />
              ))}
            </>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" className="w-full text-primary-700 bg-primary-50 hover:bg-primary-100 border-primary-100">
            View all tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
