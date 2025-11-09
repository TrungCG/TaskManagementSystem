'use client';

import { Task } from '@/lib/types';
import { mockApi } from '@/lib/mock/mockApi';

interface TaskCardProps {
  task: Task;
  projectName?: string;
  onClick?: () => void;
  onUpdate?: (task: Task) => void;
}

export default function TaskCard({ task, projectName, onClick, onUpdate }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';
  
  const priorityColor = {
    HIGH: 'bg-red-100 text-red-700',
    MED: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700'
  }[task.priority];

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    
    try {
      const updatedTask = await mockApi.updateTask(task.project, task.id, { status: newStatus });
      onUpdate?.(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 cursor-pointer transition-all group"
    >
      {/* Checkbox + Task Info */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className="shrink-0 mt-0.5 sm:mt-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <div className={`w-5 h-5 rounded border-2 transition-colors
            ${task.status === 'DONE' 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-gray-400'
            }`}>
            {task.status === 'DONE' && (
              <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
          </div>
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColor}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
          )}
        </div>
      </div>

      {/* Project Badge + Due Date */}
      <div className="flex items-center gap-2 sm:gap-3 ml-8 sm:ml-0">
        {projectName && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="truncate max-w-[100px]">{projectName}</span>
          </div>
        )}

        {task.due_date && (
          <span className={`text-xs whitespace-nowrap ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}