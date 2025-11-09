'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { mockApi } from '@/lib/mock/mockApi';
import { Project, Task, User } from '@/lib/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskDetailPanel from '@/components/layout/TaskDetailPanel';
import ManageMembersModal from '@/components/members/ManageMembersModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { Users, Plus } from 'lucide-react';
import { useToast } from '@/lib/contexts/ToastContext';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const { showToast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  useEffect(() => {
    Promise.all([
      mockApi.getProject(projectId),
      mockApi.getTasks(projectId)
    ]).then(([projectData, tasksData]) => {
      setProject(projectData);
      setTasks(tasksData);
    });
  }, [projectId]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
    showToast('Task created successfully!', 'success');
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    showToast('Task updated!', 'success');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'TODO';
    if (filter === 'in-progress') return task.status === 'INPR';
    if (filter === 'done') return task.status === 'DONE';
    return true;
  });

  const getMemberInitials = (user: User) => {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M15 3H9V5H15V3M19 3H17V5H19V3M21 1H3C1.9 1 1 1.9 1 3V21C1 22.1 1.9 23 3 23H21C22.1 23 23 22.1 23 21V3C23 1.9 22.1 1 21 1M21 21H3V7H21V21M7 3H5V5H7V3Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Member Avatars */}
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map(member => (
                  <div 
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                    title={`${member.first_name} ${member.last_name}`}
                  >
                    {getMemberInitials(member)}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-white">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowMembersModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Members</span>
                <span className="sm:hidden">Members</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="px-4 md:px-8 py-4 md:py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Task</span>
                </button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-2 md:gap-4 border-b border-gray-200 overflow-x-auto pb-2 -mb-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'todo', label: 'To Do' },
                  { id: 'in-progress', label: 'In Progress' },
                  { id: 'done', label: 'Done' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                      ${filter === tab.id 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No tasks found</p>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      onClick={() => setSelectedTask(task)}
                      onUpdate={handleTaskUpdate}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel 
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Members Modal */}
      {showMembersModal && project && (
        <ManageMembersModal
          project={project}
          onClose={() => setShowMembersModal(false)}
          onUpdate={(updatedProject) => setProject(updatedProject)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </>
  );
}