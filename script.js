document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const motivationToast = document.getElementById('motivation-toast');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Создаём скрытый input для Flatpickr ---
    const reminderInput = document.createElement('input');
    reminderInput.type = 'text'; // чтобы браузер не валидировал как date
    reminderInput.id = 'reminder-input';
    reminderInput.style.display = 'none';
    reminderInput.style.position = 'absolute';
    reminderInput.style.opacity = '0';
    document.querySelector('.reminder-wrapper').appendChild(reminderInput);

    const calendarIcon = document.querySelector('.calendar-icon');

    // --- Мотивационные сообщения ---
    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!"
    ];

    function showMotivationMessage() {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        if (motivationToast) {
            motivationToast.textContent = randomMessage;
            motivationToast.classList.remove('fade-out');
            motivationToast.classList.add('show');
            setTimeout(() => {
                motivationToast.classList.add('fade-out');
                setTimeout(() => motivationToast.classList.remove('show'), 500);
            }, 5000);
        }
    }

    // --- Темы ---
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    if (themeToggle) themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';

    if (themeToggle) {
        themeToggle.addEventListener('click', e => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
        });
    }

    // --- Flatpickr ---
    const flatpickrInstance = flatpickr(reminderInput, {
        enableTime: true,
        dateFormat: "m/d/Y h:i K",
        time_24hr: false,
        locale: "en",
        defaultDate: new Date(),
        allowInput: true,
        minDate: null,
        onChange: (selectedDates, dateStr, instance) => {
            if (selectedDates.length > 0) instance.close();
        },
    });

    calendarIcon.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        reminderInput.style.display = 'block';
        reminderInput.style.opacity = '0';
        setTimeout(() => {
            reminderInput.style.transition = 'opacity 0.3s ease';
            reminderInput.style.opacity = '1';
        }, 10);
        flatpickrInstance.open();
    });

    document.addEventListener('click', e => {
        if (!calendarIcon.contains(e.target) && !reminderInput.contains(e.target)) {
            reminderInput.style.opacity = '0';
            setTimeout(() => {
                reminderInput.style.display = 'none';
                flatpickrInstance.close();
            }, 300);
        }
    });

    // --- Разрешение уведомлений ---
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // --- Загрузка задач ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks();
    setupReminders();

    // --- Добавление задачи ---
    if (taskForm) {
        taskForm.addEventListener('submit', e => {
            e.preventDefault();
            const taskText = taskInput.value.trim();
            if (!taskText) {
                alert('Please provide a task description!');
                return;
            }
            const reminderTime = reminderInput.value || null;
            const newTask = { text: taskText, completed: false, reminder: reminderTime };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            setupReminders();
            taskInput.value = '';
            reminderInput.value = '';
            reminderInput.style.display = 'none';
            reminderInput.style.opacity = '0';
        });
    }

    // --- Рендер задач ---
    function renderTasks() {
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                if (task.completed) li.classList.add('completed');

                const taskContent = document.createElement('div');
                taskContent.classList.add('task-content');
                taskContent.textContent = task.text;

                if (task.reminder) {
                    const reminderDate = new Date(task.reminder);
                    if (!isNaN(reminderDate.getTime())) {
                        const reminderDisplay = document.createElement('span');
                        reminderDisplay.classList.add('reminder-time');
                        reminderDisplay.textContent = ` - Reminder: ${reminderDate.toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}`;
                        taskContent.appendChild(reminderDisplay);
                    }
                }

                const completeBtn = document.createElement('button');
                completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
                completeBtn.onclick = e => {
                    e.preventDefault();
                    tasks[index].completed = !tasks[index].completed;

                    // Показываем мотивационное сообщение только при отметке выполненной
                    if (tasks[index].completed) showMotivationMessage();

                    saveTasks();
                    renderTasks();
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = e => {
                    e.preventDefault();
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                };

                li.append(taskContent, completeBtn, deleteBtn);
                taskList.appendChild(li);
            });
        }
    }

    // --- Сохранение задач ---
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // --- Настройка напоминаний ---
    function setupReminders() {
        tasks.forEach((task) => {
            if (task.reminder && !task.completed) {
                const reminderTime = new Date(task.reminder).getTime();
                const now = Date.now();
                const delay = Math.max(reminderTime - now, 0);
                setTimeout(() => {
                    if (Notification.permission === 'granted' && !task.completed) {
                        new Notification('Task Reminder', { body: task.text, icon: 'https://via.placeholder.com/32' });
                    }
                }, delay);
            }
        });
    }
});
