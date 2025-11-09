'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Edit2 } from 'lucide-react';
import { Task, Comment } from '@/lib/types';
import { mockApi } from '@/lib/mock/mockApi';
import { useToast } from '@/lib/contexts/ToastContext';

interface TaskDetailPanelProps {
  task: Task;
  projectId: number;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
  onDelete?: () => void;
}

export default function TaskDetailPanel({ task, projectId, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority
  });
  const { showToast } = useToast();

  useEffect(() => {
    mockApi.getComments(projectId, task.id).then(setComments);
  }, [projectId, task.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = await mockApi.postComment(projectId, task.id, newComment);
    setComments([...comments, comment]);
    setNewComment('');
    showToast('Comment added!', 'success');
  };

  const handleUpdate = async () => {
    try {
      const updatedTask = await mockApi.updateTask(projectId, task.id, editData);
      onUpdate?.(updatedTask);
      setIsEditing(false);
      showToast('Task updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      // Mock delete - in real app would call API
      onDelete?.();
      onClose();
      showToast('Task deleted!', 'success');
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  return (
    <aside className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full fixed md:static inset-0 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="flex-1 text-lg font-semibold border-b border-gray-300 focus:border-blue-500 outline-none mr-2"
          />
        ) : (
          <h2 className="text-lg font-semibold truncate flex-1">{task.title}</h2>
        )}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Save"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Assignee */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Assignee</label>
          <p className="mt-1 text-sm text-gray-900">
            {task.assignee 
              ? `${task.assignee.first_name} ${task.assignee.last_name}` 
              : 'Unassigned'
            }
          </p>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Due Date</label>
          <p className="mt-1 text-sm text-gray-900">
            {task.due_date 
              ? new Date(task.due_date).toLocaleDateString('en-US', { dateStyle: 'long' })
              : 'No due date'
            }
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="TODO">To Do</option>
              <option value="INPR">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          ) : (
            <p className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded
                ${task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                  task.status === 'INPR' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                {task.status === 'TODO' ? 'To Do' : 
                 task.status === 'INPR' ? 'In Progress' : 
                 'Done'}
              </span>
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
          {isEditing ? (
            <select
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MED">Medium</option>
              <option value="HIGH">High</option>
            </select>
          ) : (
            <p className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded
                ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                  task.priority === 'MED' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {task.priority}
              </span>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
          {isEditing ? (
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
              rows={4}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-700">
              {task.description || 'No description provided.'}
            </p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">
            Comments ({comments.length})
          </label>
          
          <div className="space-y-3 mb-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No comments yet.</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                      {comment.author.first_name[0]}{comment.author.last_name[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {comment.author.first_name} {comment.author.last_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">{comment.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Comment
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}