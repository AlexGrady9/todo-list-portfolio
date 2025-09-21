// React stuff and routing
import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Boards from './components/Boards';
import Board from './components/Board';

// Global auth state
export const AuthContext = createContext();

// Main app component
function App() {
  // Keep track of login token, survives page refreshes
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Clear everything when logging out
  const logout = () => {
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <Router>
        <div className="min-h-screen bg-gray-100">

          {/* Top bar for logged in users */}
          {token && (
            <header className="bg-white shadow-sm p-4">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">ToDo App</h1>
                <button onClick={logout} className="btn-primary">Logout</button>
              </div>
            </header>
          )}

          {/* Page routing with login checks */}
          <Routes>
            <Route path="/login" element={token ? <Navigate to="/boards" /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/boards" /> : <Register />} />
            <Route path="/boards" element={token ? <Boards /> : <Navigate to="/login" />} />
            <Route path="/board/:id" element={token ? <Board /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/boards" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;