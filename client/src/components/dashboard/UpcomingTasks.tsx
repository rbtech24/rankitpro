import React from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { ListChecks, Plus } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const UpcomingTasks = () => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks/upcoming'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks/upcoming');
      return response.json();
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number, completed: boolean }) => {
      const response = await apiRequest('PATCH', `/api/tasks/${taskId}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
    }
  });
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <ListChecks className="h-5 w-5 mr-2 text-indigo-600" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div 
                  key={task.id}
                  className="p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={task.completed}
                          onChange={(e) => updateTaskMutation.mutate({ 
                            taskId: task.id, 
                            completed: e.target.checked 
                          })}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Due {format(task.dueDate, 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 p-3">
        <Button variant="outline" size="sm" className="w-full text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add New Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingTasks;