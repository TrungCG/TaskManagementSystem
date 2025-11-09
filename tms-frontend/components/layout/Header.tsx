// components/layout/Header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, Menu, X } from 'lucide-react';
import { mockApi } from '@/lib/mock/mockApi';
import { User } from '@/lib/types';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mockApi.getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const userInitials = user 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '?';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-3 md:px-4 gap-2 md:gap-4">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-gray-100 rounded"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Hamburger + Create */}
      <div className="hidden md:flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="currentColor"/>
          </svg>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>

      {/* Mobile Create Button */}
      <button className="md:hidden p-2 bg-orange-600 hover:bg-orange-700 text-white rounded">
        <Plus className="w-5 h-5" />
      </button>

      {/* Search Bar - Desktop */}
      <div className="hidden md:flex flex-1 max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search student.humg.edu.vn"
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded text-sm outline-none transition-colors"
          />
        </div>
      </div>

      {/* Mobile Search Toggle */}
      <button 
        onClick={() => setShowMobileSearch(!showMobileSearch)}
        className="md:hidden p-2 hover:bg-gray-100 rounded ml-auto"
      >
        {showMobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="absolute top-14 left-0 right-0 p-3 bg-white border-b border-gray-200 md:hidden z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded text-sm outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* User Avatar */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
            {userInitials}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
