// Imports - gathering the team for the big work
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Our reliable courier for server communication
import { AuthContext } from '../App';
import { useDrop } from 'react-dnd'; // Drag & drop magic - like in a game
import Task from './Task';
import MotivationalToast from './MotivationalToast'; // Our motivator
import useMotivationalSound from '../hooks/useMotivationalSound'; // Victory sounds

const API_BASE_URL = 'https://todo-list-backend-ruy4.onrender.com'; // Replace with your Render URL

const Board = () => {
  // Get board ID from URL - like our home address
  const { id } = useParams();

  // Component states - its living soul
  const [tasks, setTasks] = useState([]); // Array of tasks - our to-do list
  const [title, setTitle] = useState(''); // Title of new task
  const [description, setDescription] = useState(''); // Description - details matter
  const [editingTask, setEditingTask] = useState(null); // Which task are we editing
  const [editTitle, setEditTitle] = useState(''); // New title when editing
  const [editDescription, setEditDescription] = useState(''); // New description
  const [showMotivationalToast, setShowMotivationalToast] = useState(false); // Show motivational toast

  const { token } = useContext(AuthContext); // Authorization token - our pass
  const { playSound } = useMotivationalSound(); // Hook for victory sounds

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Grab task list from server
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks?board_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (err) {
      console.error(err);
    }
  };  // Create new task
  const createTask = async () => {
    try {
      await axios.post(`${API_BASE_URL}/tasks`, { 
        title, 
        description, 
        board_id: parseInt(id) 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete task - sad but sometimes necessary
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return; // Last chance to change mind
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }, // Delete with full responsibility
      });
      fetchTasks(); // Update list - forgive the task forever
    } catch (err) {
      console.error(err); // Even deletion can go wrong - life is complicated
    }
  };

  // Start editing - time to change something
  const startEditTask = (task) => {
    setEditingTask(task.id); // Remember which task we're editing
    setEditTitle(task.title); // Load current title
    setEditDescription(task.description); // And description too - work with original
  };

  // Save changes - fix the result of creativity
  const saveEditTask = async () => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${editingTask}`, {
        title: editTitle,
        description: editDescription
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingTask(null); // Finish editing
      setEditTitle(''); // Clear temporary fields
      setEditDescription('');
      fetchTasks(); // Look at the updated result
    } catch (err) {
      console.error(err); // Couldn't save - try again
    }
  };

  // Cancel editing - changed mind, happens
  const cancelEditTask = () => {
    setEditingTask(null); // Exit editing mode
    setEditTitle(''); // Reset all changes
    setEditDescription(''); // As if nothing happened
  };

  // Update task status via drag-and-drop
  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Motivational feature when task is completed
      if (status === 'done') {
        setShowMotivationalToast(true);
        playSound();
      }
      
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Column - our container for tasks of specific status
  const Column = ({ status, title }) => {
    // Set up drop zone - place where tasks can be dragged
    const [{ isOver }, drop] = useDrop({
      accept: 'task', // Accept only tasks - order first
      drop: (item) => updateTaskStatus(item.id, status), // On drop change status - magic
      collect: (monitor) => ({
        isOver: !!monitor.isOver(), // Monitor if something is over us
      }),
    });

    // Filter tasks by status - each status has its column
    const columnTasks = tasks.filter(task => task.status === status);

    return (
      <div ref={drop} className={`column ${isOver ? 'over' : ''}`}>
        <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">{title}</h3>
        {columnTasks.map(task => (
          editingTask === task.id ? (
            <div key={task.id} className="task-card">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-field mb-2 text-sm"
                placeholder="Title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="input-field mb-2 text-sm"
                placeholder="Description"
                rows="2"
              />
              <div className="flex gap-1">
                <button onClick={saveEditTask} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                <button onClick={cancelEditTask} className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <Task key={task.id} task={task} onEdit={startEditTask} onDelete={deleteTask} />
          )
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl mb-8 text-center font-bold text-white">Board Tasks</h1>
      <div className="mb-8 flex justify-center">
        <div className="card p-6 w-full max-w-lg">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-4"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field mb-4"
          />
          <button onClick={createTask} className="btn-primary w-full">Add Task</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column status="todo" title="To Do" />
        <Column status="in-progress" title="In Progress" />
        <Column status="done" title="Done" />
      </div>
      
      {/* The magic happens here - our motivational toast! */}
      <MotivationalToast 
        show={showMotivationalToast}
        onClose={() => setShowMotivationalToast(false)}
      />
    </div>
  );
};

export default Board;
