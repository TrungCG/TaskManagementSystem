// components/members/ManageMembersModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { Project, User } from '@/lib/types';
import { mockApi } from '@/lib/mock/mockApi';

interface ManageMembersModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

export default function ManageMembersModal({ project, onClose, onUpdate }: ManageMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentMembers, setCurrentMembers] = useState<User[]>(project.members);

  const performSearch = useCallback(async (query: string) => {
    if (query.length >= 2) {
      const users = await mockApi.searchUsers(query);
      const memberIds = new Set(currentMembers.map(m => m.id));
      setSearchResults(users.filter(u => !memberIds.has(u.id)));
    } else {
      setSearchResults([]);
    }
  }, [currentMembers]);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleAddMember = async (user: User) => {
    await mockApi.addMember(project.id, user.id);
    const updatedMembers = [...currentMembers, user];
    setCurrentMembers(updatedMembers);
    setSearchQuery('');
    
    const updatedProject = { ...project, members: updatedMembers };
    onUpdate(updatedProject);
  };

  const handleRemoveMember = async (userId: number) => {
    await mockApi.removeMember(project.id, userId);
    const updatedMembers = currentMembers.filter(m => m.id !== userId);
    setCurrentMembers(updatedMembers);
    
    const updatedProject = { ...project, members: updatedMembers };
    onUpdate(updatedProject);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Manage Members</h2>
              <p className="text-sm text-gray-600 mt-1">For &quot;{project.name}&quot;</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add new member
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm transition-colors"
                    >
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Project Members ({currentMembers.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentMembers.map(member => {
                const isOwner = member.id === project.owner.id;
                return (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {member.first_name} {member.last_name}
                          {isOwner && <span className="ml-2 text-xs text-gray-500">(Owner)</span>}
                        </div>
                        <div className="text-xs text-gray-500">@{member.username}</div>
                      </div>
                    </div>
                    {!isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
