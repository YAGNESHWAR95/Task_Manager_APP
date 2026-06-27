import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/tasks`;

const TaskItem = ({ task, fetchTasks, fetchStats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    tags: task.tags ? task.tags.join(', ') : ''
  });

  const toggleComplete = async () => {
    try {
      await axios.patch(`${API_URL}/${task._id}`, {
        completed: !task.completed
      });
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Error toggling completion", err);
    }
  };

  const deleteTask = async () => {
    try {
      await axios.delete(`${API_URL}/${task._id}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const handleSave = async () => {
    if (!editData.title.trim()) return;
    try {
      const payload = {
        title: editData.title,
        description: editData.description,
        priority: editData.priority,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : null,
        tags: editData.tags ? editData.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []
      };

      await axios.patch(`${API_URL}/${task._id}`, payload);
      setIsEditing(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags ? task.tags.join(', ') : ''
    });
    setIsEditing(false);
  };

  const priorityStyles = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-green-50 text-green-700 border-green-200'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Determine if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  if (isEditing) {
    return (
      <div className="p-5 bg-white border border-blue-200 rounded-2xl shadow-md space-y-4 animate-fadeIn">
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Task Title"
            required
          />
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <textarea 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y min-h-[60px]"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Task Description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
            <input 
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
            <input 
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              value={editData.tags}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
              placeholder="e.g. design, bug"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col p-5 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 ${task.completed ? 'bg-slate-50/50 border-slate-100 opacity-65' : 'hover:shadow-md hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox and Task Details */}
        <div className="flex items-start gap-4 flex-1">
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={toggleComplete}
            className="w-5 h-5 mt-0.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h3>
              <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
              
              {isOverdue && (
                <span className="bg-red-50 text-red-600 border border-red-150 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Overdue
                </span>
              )}
            </div>

            {task.description && (
              <p className={`text-sm text-slate-500 whitespace-pre-line leading-relaxed ${task.completed ? 'line-through text-slate-350' : ''}`}>
                {task.description}
              </p>
            )}

            {/* Tags and Due Date Display */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1.5 text-xs text-slate-400">
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20a1 1 0 001-1v-4.07a1 1 0 01.293-.707l7.593-7.593a1 1 0 000-1.414L13.414 3.7a1 1 0 00-1.414 0L4.407 11.293a1 1 0 01-.707.293H3.6a1 1 0 00-1 1v4.07a1 1 0 001 1h3z" />
                  </svg>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded text-[10px] transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Edit / Delete) */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsEditing(true)} 
            className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            title="Edit Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button 
            onClick={deleteTask} 
            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            title="Delete Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;