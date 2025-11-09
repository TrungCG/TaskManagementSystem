// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Inbox, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mock/mockApi';
import { Project } from '@/lib/types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    mockApi.getProjects().then(setProjects);
  }, []);

  const navItems = [
    { href: '/my-tasks', label: 'My tasks', icon: CheckSquare, id: 'my-tasks' },
    { href: '/inbox', label: 'Inbox', icon: Inbox, id: 'inbox' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-gray-50 border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out
          md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {navItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${pathname === item.href 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}

          <div className="pt-6">
            <div className="flex items-center justify-between px-3 pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Projects</h3>
              <button className="text-gray-400 hover:text-gray-600">+</button>
            </div>
            <div className="space-y-1">
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={onClose}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                    ${pathname === `/projects/${project.id}`
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
