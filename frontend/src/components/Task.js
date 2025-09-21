// Imports for task component
import React from 'react';
import { useDrag } from 'react-dnd';

// Individual task component with drag-and-drop support
const Task = ({ task, onEdit, onDelete }) => {
  // Set up dragging for changing task status
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`task-card ${isDragging ? 'opacity-50' : ''} relative`}>
      <h4 className="font-bold text-gray-800 mb-1">{task.title}</h4>
      <p className="text-gray-600 text-sm">{task.description}</p>
      
      {/* Task actions */}
      <div className="flex gap-1 mt-2">
        <button 
          onClick={() => onEdit(task)} 
          className="bg-yellow-500 text-white text-xs px-2 py-1 rounded"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(task.id)} 
          className="bg-red-500 text-white text-xs px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Task;
