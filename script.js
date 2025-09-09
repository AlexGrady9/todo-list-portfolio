document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const calendarIcon = document.querySelector('.calendar-icon');
    const taskList = document.getElementById('task-list');
    const motivationToast = document.getElementById('motivation-toast');
    const themeToggle = document.getElementById('theme-toggle');
    const confettiContainer = document.getElementById('confetti-container');
    const enableNotificationsBtn = document.getElementById('enable-notifications'); // Кнопка для уведомлений

    // Массив мотивирующих сообщений
    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!"
    ];

    // Внутренний элемент для хранения выбранного времени (скрытый)
    let selectedReminder = null;
    let flatpickrInstance = null;

    // Инициализация Flatpickr, привязанного к иконке
    if (calendarIcon) {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.display = 'none'; // Скрываем элемент
        document.body.appendChild(input);

        flatpickrInstance = flatpickr(input, {
            enableTime: true,
            dateFormat: "m/d/Y h:i K", // MM/DD/YYYY, HH:MM AM/PM
            time_24hr: false,
            locale: "en", // Английский язык
            defaultDate: new Date(), // Текущая дата (09/09/2025, 09:55 PM KST)
            onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    selectedReminder = selectedDates[0]; // Сохраняем выбранную дату
                    console.log('Selected reminder:', dateStr); // Отладка
                }
            },
            onClose: function(selectedDates, dateStr, instance) {
                console.log('Calendar closed, selected:', dateStr); // Отладка
            }
        });

        calendarIcon.addEventListener('mouseover', (e) => {
            if (window.innerWidth > 600) { // Показываем только на десктопе при наведении
                flatpickrInstance.open();
                console.log('Calendar opened on hover'); // Отладка
            }
        });

        calendarIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            flatpickrInstance.open(); // Открываем календарь при клике (для смартфонов и десктопа)
            console.log('Calendar opened on click'); // Отладка
        });

        document.addEventListener('click', (e) => {
            if (!calendarIcon.contains(e.target)) {
                flatpickrInstance.close(); // Закрываем при клике вне иконки
                console.log('Calendar closed (outside click)'); // Отладка
            }
        });
    } else {
        console.error('Calendar icon not found'); // Отладка
    }

    // Загрузка темы
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
        console.log('Theme loaded:', currentTheme); // Отладка
    } else {
        console.error('Theme toggle button not found'); // Отладка
    }

    // Переключение темы
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
            console.log('Theme switched to:', currentTheme); // Отладка
        });
    }

    // Запрос разрешения на уведомления
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (Notification.permission !== 'granted') {
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission); // Отладка
                    if (permission === 'granted') {
                        enableNotificationsBtn.textContent = 'Reminders Enabled!';
                        enableNotificationsBtn.style.background = 'var(--complete-btn-bg)';
                    }
                });
            }
        });
    }

    // Загрузка задач
    let tasks = [];
    try {
        const storedTasks = localStorage.getItem('tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
        console.log('Initial tasks loaded:', tasks); // Отладка
    } catch (e) {
        console.error('Error loading tasks from LocalStorage:', e); // Отладка
    }
    renderTasks();
    setupReminders();

    // Добавление задачи
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const taskText = taskInput.value.trim();

            if (!taskText) {
                console.log('Empty task input'); // Отладка
                return;
            }

            const newTask = {
                text: taskText,
                completed: false,
                reminder: selectedReminder ? selectedReminder.toISOString() : null
            };
            tasks.push(newTask);
            console.log('Task added:', newTask); // Отладка
            saveTasks();
            renderTasks();
            setupReminders();
            taskInput.value = '';
            selectedReminder = null; // Сбрасываем выбранное время
        });
    } else {
        console.error('Task form not found'); // Отладка
    }

    // Показ мотивирующего сообщения и анимации
    function showMotivationMessage() {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        if (motivationToast) {
            motivationToast.textContent = randomMessage;
            motivationToast.classList.add('show');
            setTimeout(() => motivationToast.classList.remove('show'), 3000);
            console.log('Motivation message shown:', randomMessage); // Отладка
        } else {
            console.error('Motivation toast not found'); // Отладка
        }

        if (confettiContainer) {
            confettiContainer.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.animationDelay = `${Math.random() * 0.5}s`;
                confettiContainer.appendChild(confetti);
            }
            setTimeout(() => confettiContainer.innerHTML = '', 2000);
            console.log('Confetti animation triggered'); // Отладка
        } else {
            console.error('Confetti container not found'); // Отладка
        }
    }

    // Рендер задач
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
                    const reminderDisplay = document.createElement('span');
                    reminderDisplay.classList.add('reminder-time');
                    try {
                        const reminderDate = new Date(task.reminder);
                        if (!isNaN(reminderDate.getTime())) {
                            reminderDisplay.textContent = `Reminder: ${reminderDate.toLocaleString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}`;
                            taskContent.appendChild(reminderDisplay);
                        } else {
                            console.warn('Invalid reminder date for task:', task); // Отладка
                        }
                    } catch (e) {
                        console.error('Error parsing reminder date:', e); // Отладка
                    }
                }

                const completeBtn = document.createElement('button');
                completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
                completeBtn.onclick = (e) => {
                    e.preventDefault();
                    tasks[index].completed = !tasks[index].completed;
                    if (tasks[index].completed) showMotivationMessage();
                    saveTasks();
                    renderTasks();
                    console.log('Task completed:', tasks[index]); // Отладка
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                    console.log('Task deleted:', index); // Отладка
                };

                li.append(taskContent, completeBtn, deleteBtn);
                taskList.appendChild(li);
            });
            console.log('Tasks rendered:', tasks); // Отладка
        } else {
            console.error('Task list not found'); // Отладка
        }
    }

    // Сохранение в LocalStorage
    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            console.log('Tasks saved:', tasks); // Отладка
        } catch (e) {
            console.error('Error saving tasks to LocalStorage:', e); // Отладка
        }
    }

    // Настройка напоминаний
    function setupReminders() {
        tasks.forEach((task, index) => {
            if (task.reminder && !task.completed) {
                try {
                    const reminderTime = new Date(task.reminder).getTime();
                    const now = Date.now();
                    if (reminderTime > now) {
                        setTimeout(() => {
                            if (Notification.permission === 'granted' && !task.completed) {
                                new Notification('Task Reminder', {
                                    body: task.text,
                                    icon: 'https://via.placeholder.com/32'
                                });
                                console.log('Reminder triggered:', task.text); // Отладка
                            }
                        }, reminderTime - now);
                    }
                } catch (e) {
                    console.error('Error setting up reminder:', e); // Отладка
                }
            }
        });
    }
});