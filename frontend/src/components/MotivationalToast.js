import React, { useState, useEffect } from 'react';

// Set of motivational messages for random selection
const motivationalMessages = [
  "🎉 Boom! Another task bites the dust!",
  "⚡ Hell yeah! You're crushing it today!",
  "🔥 On fire! Keep that momentum rolling!",
  "🚀 Beast mode activated! Nothing can stop you!",
  "💪 Damn right! Every done task is pure gold!",
  "🌟 You absolute legend! Productivity hero right here!",
  "🏆 Nailed it! Success loves the hustle!",
  "✨ Pure magic! Dreams becoming reality!",
  "🎯 Bullseye! You've got laser focus!",
  "🌈 Sweet! Each step gets you closer to greatness!",
  "🔋 Electric! You're charging up the whole team!",
  "🎊 Victory dance time! Another win in the bag!",
  "💎 Brilliant! You make ordinary days extraordinary!",
  "🎪 Mind-blowing! You're making miracles happen!",
  "🎈 Inspiring as hell! Your drive lights up the universe!"
];

// Motivational notification component for task completion
const MotivationalToast = ({ show, onClose }) => {
  const [message, setMessage] = useState('');

  // Logic for showing and auto-hiding the toast
  useEffect(() => {
    if (show) {
      // Random selection of motivational message
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMessage(randomMessage);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="motivational-toast bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-300 transform transition-all duration-300 hover:scale-105 max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-spin">🎉</span>
            <p className="font-bold text-lg leading-tight">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 text-white hover:text-green-200 font-bold text-xl leading-none hover:bg-green-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200"
          >
            ×
          </button>
        </div>
        <div className="mt-2 h-1 bg-green-300 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default MotivationalToast;