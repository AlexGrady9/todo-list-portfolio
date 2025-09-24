import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const API_BASE_URL = 'https://your-backend-url.onrender.com'; // Replace with your Render URL

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const { token } = useContext(AuthContext);

  // Load boards when component first appears
  useEffect(() => {
    fetchBoards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get all boards from the server
  const fetchBoards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a whole board - careful with this one
  const deleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board and all its tasks?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBoards();
    } catch (err) {
      console.error(err);
    }
  };

  // Create a new board
  const createBoard = async () => {
    try {
      await axios.post(`${API_BASE_URL}/boards`, { title }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle('');
      fetchBoards();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditBoard = (board) => {
    setEditingBoard(board.id);
    setEditTitle(board.title);
  };

  const saveEditBoard = async () => {
    try {
      await axios.put(`${API_BASE_URL}/boards/${editingBoard}`, { title: editTitle }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingBoard(null);
      setEditTitle('');
      fetchBoards();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEditBoard = () => {
    setEditingBoard(null);
    setEditTitle('');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl mb-8 text-center font-bold text-white">My Boards</h1>
      <div className="mb-8 flex justify-center">
        <div className="card p-6 w-full max-w-md">
          <input
            type="text"
            placeholder="New Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-4"
          />
          <button onClick={createBoard} className="btn-primary w-full">Create Board</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map(board => (
          <div key={board.id} className="card p-6 relative">
            {editingBoard === board.id ? (
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input-field mb-4"
                />
                <div className="flex gap-2">
                  <button onClick={saveEditBoard} className="btn-primary flex-1">Save</button>
                  <button onClick={cancelEditBoard} className="bg-gray-500 text-white p-2 rounded flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <Link to={`/board/${board.id}`} className="block">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">{board.title}</h2>
                  <p className="text-gray-600">Click to open</p>
                </Link>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => startEditBoard(board)} className="bg-yellow-500 text-white p-2 rounded flex-1">Edit</button>
                  <button onClick={() => deleteBoard(board.id)} className="bg-red-500 text-white p-2 rounded flex-1">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boards;
