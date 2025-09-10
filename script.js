document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const motivationToast = document.getElementById('motivation-toast');
  const themeToggle = document.getElementById('theme-toggle');

  // Скрытый input для Flatpickr
  const reminderInput = document.createElement('input');
  reminderInput.type = 'text';
  reminderInput.id = 'reminder-input';
  reminderInput.required = false;
  reminderInput.style.display = 'none'; // всегда скрыт
  document.querySelector('.reminder-wrapper').appendChild(reminderInput);

  const calendarIcon = document.querySelector('.calendar-icon');

  // Загрузка задач
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Тема
  let currentTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light-theme', currentTheme === 'light');
  themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
  });

  // Flatpickr (без строки altInput, только календарь)
  const flatpickrInstance = flatpickr(reminderInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: false,
    defaultDate: new Date(),
    locale: "en", // английский язык
    minDate: null
  });

  // Показ календаря по клику на иконку
  calendarIcon.addEventListener('click', e => {
    e.preventDefault();
    flatpickrInstance.open();
    // анимация появления календаря
    setTimeout(() => {
      flatpickrInstance.calendarContainer.style.animation = 'fadeIn 0.3s ease-out';
    }, 5);
  });

  // Уведомления
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const messages = [
    "Great job! Keep it up!",
    "You're crushing it!",
    "One step closer to your goals!",
    "Amazing work! Stay focused!",
    "You're unstoppable today!",
    "Nice one! Keep pushing forward!"
  ];

  function showMotivation() {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    motivationToast.textContent = msg;
    motivationToast.classList.add('show');
    setTimeout(() => motivationToast.classList.remove('show'), 4000);
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      if (task.completed) li.classList.add('completed');

      const taskContent = document.createElement('div');
      taskContent.textContent = task.text;

      const completeBtn = document.createElement('button');
      completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
      completeBtn.onclick = () => {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) showMotivation();
        saveTasks();
        renderTasks();
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      };

      li.append(taskContent, completeBtn, deleteBtn);
      taskList.appendChild(li);
    });
  }

  function setupReminders() {
    tasks.forEach((task, index) => {
      if (task.reminder && !task.completed) {
        const delay = new Date(task.reminder).getTime() - Date.now();
        if (delay >= 0) {
          setTimeout(() => {
            if (Notification.permission === 'granted' && !tasks[index].completed) {
              new Notification('Task Reminder', { body: task.text });
            }
          }, delay);
        }
      }
    });
  }

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return alert('Please enter a task');

    tasks.push({ text, completed: false, reminder: reminderInput.value || null });
    taskInput.value = '';
    reminderInput.value = '';
    saveTasks();
    renderTasks();
    setupReminders();
  });

  renderTasks();
  setupReminders();
});
