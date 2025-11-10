'use client';

import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mock/mockApi';
import { Task, User, Project } from '@/lib/types';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useToast } from '@/lib/contexts/ToastContext';

type FilterType = 'upcoming' | 'overdue' | 'completed';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      mockApi.getCurrentUser(),
      mockApi.getAllMyTasks(),
      mockApi.getProjects()
    ]).then(([currentUser, allTasks, allProjects]) => {
      setUser(currentUser);
      setTasks(allTasks);
      setProjects(allProjects);
    });
  }, []);

  const handleCreateTask = () => {
    if (projects.length === 0) {
      showToast('Please create a project first', 'warning');
      return;
    }
    setSelectedProjectId(projects[0].id);
    setShowCreateModal(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
    showToast('Task created successfully!', 'success');
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    showToast('Task updated!', 'success');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.status === 'DONE';
    if (filter === 'overdue') {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      return dueDate && dueDate < new Date() && task.status !== 'DONE';
    }
    return task.status !== 'DONE';
  });

  const getProjectName = (projectId: number) => {
    return projects.find(p => p.id === projectId)?.name;
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold mt-2">
          Good evening, <span className="text-gray-900">{user?.first_name}</span>
        </h1>
      </div>

      {/* Task Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.first_name[0]}{user?.last_name[0]}
              </div>
              <h2 className="text-lg md:text-xl font-semibold">My tasks</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 md:gap-4 border-b border-gray-200 overflow-x-auto pb-2 -mb-2">
            {(['upcoming', 'overdue', 'completed'] as FilterType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap
                  ${filter === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 md:p-6">
          <button 
            onClick={handleCreateTask}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
          >
            + Create task
          </button>
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No tasks found</p>
            ) : (
              filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectName={getProjectName(task.project)}
                  onUpdate={handleTaskUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && selectedProjectId && (
        <CreateTaskModal
          projectId={selectedProjectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}