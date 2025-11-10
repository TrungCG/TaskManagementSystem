// app/(dashboard)/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock/mockApi';
import { Project } from '@/lib/types';
import { Plus, Search } from 'lucide-react';
import CreateProjectModal from '@/components/projects/CreateProjectModal';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    mockApi.getProjects().then(setProjects);
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setShowCreateModal(false);
    router.push(`/projects/${newProject.id}`);
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Browse projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create project
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a project"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Members</div>
          <div className="col-span-3">Owner</div>
          <div className="col-span-2 text-right">Last modified</div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-xs text-gray-500 truncate">{project.description}</div>
                  )}
                </div>
              </div>

              <div className="col-span-3 flex items-center">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map(member => (
                    <div
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                      title={`${member.first_name} ${member.last_name}`}
                    >
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-white">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-3 flex items-center">
                <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                  {project.owner.first_name}'s team
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end text-sm text-gray-500">
                {new Date(project.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}
