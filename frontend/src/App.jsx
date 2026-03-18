import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './components/TaskItem';

function App() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium' });

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await axios.post('http://localhost:5000/api/tasks', formData);
    setFormData({ title: '', priority: 'Medium' });
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Task Manager</h1>
          <p className="text-slate-500 mt-2">Organize your workflow professionally.</p>
        </header>

        {/* Create Task Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-200">
              Add
            </button>
          </div>
        </form>

        {/* List Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Active Tasks</h2>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskItem key={task._id} task={task} fetchTasks={fetchTasks} />
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              No tasks yet. Start by adding one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;