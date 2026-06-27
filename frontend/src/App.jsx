import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './components/TaskItem';
import Auth from './components/Auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/tasks`;

function App() {
  // Session / Authentication state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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

  // Sync token to Axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Handle Token expiration / unauthorized responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Fetch only the tasks matching current search, filters, and sort options
  const fetchTasks = async () => {
    if (!token) return;
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
    if (!token) return;
    try {
      const res = await axios.get(API_URL);
      setAllTasks(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchTasks();
    }
  }, [token]);

  // Debounced search & query sync
  useEffect(() => {
    if (!token) return;
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterCompleted, filterPriority, sortBy, token]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTasks([]);
    setAllTasks([]);
  };

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

  // Render Login/Signup view if not logged in
  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Premium Header */}
        <header className="mb-10 text-center relative flex flex-col items-center">
          {/* User Profile Badge & Logout Button */}
          <div className="w-full flex items-center justify-between sm:justify-end gap-3 mb-6 sm:absolute sm:right-0 sm:top-0 sm:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-600 uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold text-slate-800">@{user?.username}</span>
                <span className="text-[10px] text-slate-450 font-medium">{user?.email}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/50"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>

          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full uppercase tracking-wider mt-2 sm:mt-0">
            Workspace Manager
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            TaskFlow Pro
          </h1>
          <p className="text-slate-500 mt-2 text-md max-w-lg">
            Secured personal task dashboard with Mongo-optimized indexing and Docker.
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer">
                  Add
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Form Options */}
            <div>
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors outline-none focus:underline cursor-pointer"
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