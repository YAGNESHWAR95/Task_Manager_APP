import axios from 'axios';

const TaskItem = ({ task, fetchTasks }) => {
  const toggleComplete = async () => {
    await axios.patch(`http://localhost:5000/api/tasks/${task._id}`, {
      completed: !task.completed
    });
    fetchTasks();
  };

  const deleteTask = async () => {
    await axios.delete(`http://localhost:5000/api/tasks/${task._id}`);
    fetchTasks();
  };

  const priorityStyles = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className={`flex items-center justify-between p-4 mb-3 bg-white border rounded-xl shadow-sm transition-all ${task.completed ? 'opacity-60' : 'hover:shadow-md'}`}>
      <div className="flex items-center gap-4">
        <input 
          type="checkbox" 
          checked={task.completed} 
          onChange={toggleComplete}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      <button onClick={deleteTask} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default TaskItem;