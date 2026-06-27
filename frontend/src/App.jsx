import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './components/TaskItem';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/tasks`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Used for global dashboard statistics
  
  // Creation form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    tags: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('all');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch only the tasks matching current search, filters, and sort options
  const fetchTasks = async () => {
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery;
      if (filterCompleted !== 'all') params.completed = filterCompleted === 'completed';
      if (filterPriority !== 'All') params.priority = filterPriority;
      if (sortBy) params.sortBy = sortBy;

      const res = await axios.get(API_URL, { params });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching filtered tasks", err);
    }
  };

  // Fetch all tasks to compute accurate stats (avoids environment drift/inconsistencies)
  const fetchStats = async () => {
    try {
      const res = await axios.get(API_URL);
      setAllTasks(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search & query sync
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterCompleted, filterPriority, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []
    };

    try {
      await axios.post(API_URL, payload);
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        tags: ''
      });
      setShowAdvanced(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  // Compute stats
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Premium Header */}
        <header className="mb-10 text-center">
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full uppercase tracking-wider">
            Workspace Manager
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            TaskFlow Pro
          </h1>
          <p className="text-slate-500 mt-2 text-md">
            Streamlined collaborative dashboard with Mongo-optimized indexing and Docker.
          </p>
        </header>

        {/* Dashboard Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalTasks}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-500">Completed</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-1">{completedTasks}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Pending</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingTasks}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-indigo-600">{completionRate}%</h3>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Task Creation Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            Create New Task
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text"
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <div className="flex gap-2 min-w-[150px]">
                <select 
                  className="flex-1 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                  Add
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Form Options */}
            <div>
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors outline-none focus:underline"
              >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options (Description, Due Date, Tags)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                    <textarea 
                      placeholder="Add details about this task..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-y min-h-[80px]"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
                      <input 
                        type="text"
                        placeholder="design, bug, sprint1"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Filters and Controls Dashboard Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search tasks (optimized text index)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Selects */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select 
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterCompleted}
                  onChange={(e) => setFilterCompleted(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
                <select 
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                <select 
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Tasks List */}
        <main className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Tasks ({tasks.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                Found matches in title or description
              </span>
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskItem 
                  key={task._id} 
                  task={task} 
                  fetchTasks={fetchTasks} 
                  fetchStats={fetchStats}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              No tasks found. Create a new task or adjust your filters!
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;