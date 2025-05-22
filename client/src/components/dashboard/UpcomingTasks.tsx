import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ListChecks, Plus } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const UpcomingTasks = () => {
  // Mock data - would be fetched from API in real implementation
  const tasks: Task[] = [
    { 
      id: 1, 
      title: 'Review monthly SEO performance', 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      priority: 'high',
      completed: false,
    },
    { 
      id: 2, 
      title: 'Send follow-up emails to recent customers', 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
      priority: 'medium',
      completed: false,
    },
    { 
      id: 3, 
      title: 'Approve technician schedules for next week', 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 days from now
      priority: 'high',
      completed: false,
    },
    { 
      id: 4, 
      title: 'Review and approve blog posts', 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
      priority: 'medium',
      completed: false,
    },
    { 
      id: 5, 
      title: 'Quarterly marketing planning meeting', 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
      priority: 'high',
      completed: false,
    }
  ];
  
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
          <div className="space-y-3">
            {tasks.map((task) => (
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
                        onChange={() => {}}
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