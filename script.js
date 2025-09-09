document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');

    // Создаем скрытый input для Flatpickr
    const reminderInput = document.createElement('input');
    reminderInput.type = 'text';
    reminderInput.id = 'reminder-input';
    reminderInput.style.display = 'none';
    document.querySelector('.reminder-wrapper').appendChild(reminderInput);

    const calendarIcon = document.querySelector('.calendar-icon');
    const taskList = document.getElementById('task-list');
    const motivationToast = document.getElementById('motivation-toast');
    const themeToggle = document.getElementById('theme-toggle');

    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!"
    ];

    // Тема
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
    });

    // Flatpickr для календаря
    const flatpickrInstance = flatpickr(reminderInput, {
        enableTime: true,
        dateFormat: "m/d/Y h:i K",
        defaultDate: new Date(),
        minDate: "today"
    });

    calendarIcon.addEventListener('click', e => {
        e.stopPropagation();
        reminderInput.style.display = 'block';
        flatpickrInstance.open();
    });

    document.addEventListener('click', e => {
        if (!calendarIcon.contains(e.target) && !reminderInput.contains(e.target)) {
            reminderInput.style.display = 'none';
            flatpickrInstance.close();
        }
    });

    // Разрешение уведомлений
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Загрузка задач
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let reminderTimers = [];

    renderTasks();
    setupReminders();

    // Добавление задачи
    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return alert('Please provide a task description!');
        const reminderTime = reminderInput.value || null;
        tasks.push({ text, completed: false, reminder: reminderTime });
        taskInput.value = '';
        reminderInput.value = '';
        reminderInput.style.display = 'none';
        saveTasks();
        renderTasks();
        setupReminders();
    });

    // Сохранение задач
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Рендер задач
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const taskContent = document.createElement('div');
            taskContent.textContent = task.text;

            if (task.reminder) {
                const date = new Date(task.reminder);
                if (!isNaN(date)) {
                    taskContent.textContent += ` - Reminder: ${date.toLocaleString()}`;
                }
            }

            const completeBtn = document.createElement('button');
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            completeBtn.onclick = e => {
                e.preventDefault();
                tasks[index].completed = !tasks[index].completed;
                if (tasks[index].completed) showMotivationMessage();
                saveTasks();
                renderTasks();
                setupReminders();
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = e => {
                e.preventDefault();
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
                setupReminders();
            };

            li.append(taskContent, completeBtn, deleteBtn);
            taskList.appendChild(li);
        });
    }

    // Показ мотивационного сообщения
    function showMotivationMessage() {
        if (!motivationToast) return;
        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        motivationToast.textContent = message;
        motivationToast.classList.add('show');
        setTimeout(() => motivationToast.classList.remove('show'), 3000);
    }

    // Настройка напоминаний
    function setupReminders() {
        // очищаем старые таймеры
        reminderTimers.forEach(t => clearTimeout(t));
        reminderTimers = [];

        tasks.forEach(task => {
            if (task.reminder && !task.completed) {
                const reminderTime = new Date(task.reminder).getTime();
                const delay = reminderTime - Date.now();
                if (delay > 0) {
                    const timer = setTimeout(() => {
                        if (Notification.permission === 'granted') {
                            new Notification('Task Reminder', {
                                body: task.text,
                                icon: 'https://via.placeholder.com/32'
                            });
                        }
                    }, delay);
                    reminderTimers.push(timer);
                }
            }
        });
    }
});
