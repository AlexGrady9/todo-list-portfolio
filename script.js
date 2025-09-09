document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const reminderInput = document.getElementById('reminder-input');
    const calendarIcon = document.querySelector('.calendar-icon');
    const taskList = document.getElementById('task-list');
    const motivationToast = document.getElementById('motivation-toast');
    const themeToggle = document.getElementById('theme-toggle');
    const confettiContainer = document.getElementById('confetti-container');

    // Массив мотивирующих сообщений
    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!",
    ];

    // Загрузка темы из LocalStorage
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
        console.log('Theme loaded:', currentTheme); // Отладка: загруженная тема
    } else {
        console.error('Theme toggle button not found'); // Отладка: кнопка не найдена
    }

    // Переключение темы
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
            console.log('Theme switched to:', currentTheme); // Отладка: тема переключена
        });
    }

    // Инициализация Flatpickr для календаря
    if (reminderInput && calendarIcon) {
        const flatpickrInstance = flatpickr(reminderInput, {
            enableTime: true,
            dateFormat: "m/d/Y h:i K", // MM/DD/YYYY, HH:MM AM/PM
            time_24hr: false,
            locale: "en", // Английский язык
            defaultDate: new Date(), // Текущая дата (09/09/2025, 10:48 PM KST)
            onChange: function(selectedDates, dateStr) {
                if (selectedDates.length > 0) {
                    console.log('Selected reminder:', dateStr); // Отладка: выбранное время
                }
            },
            onClose: function() {
                reminderInput.style.display = 'none'; // Скрываем после выбора
                console.log('Calendar closed'); // Отладка
            }
        });

        calendarIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            reminderInput.style.display = 'block'; // Показываем input для Flatpickr
            flatpickrInstance.open(); // Открываем календарь
            console.log('Calendar opened on click'); // Отладка
        });

        // Закрытие календаря при клике вне
        document.addEventListener('click', (e) => {
            if (!calendarIcon.contains(e.target) && !reminderInput.contains(e.target)) {
                reminderInput.style.display = 'none';
                flatpickrInstance.close();
                console.log('Calendar closed (outside click)'); // Отладка
            }
        });
    } else {
        console.error('Calendar elements not found'); // Отладка
    }

    // Загрузка задач из LocalStorage
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        console.log('Initial tasks loaded:', tasks); // Отладка: загруженные задачи
    } catch (e) {
        console.error('Error loading tasks from LocalStorage:', e); // Отладка: ошибка загрузки
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
                alert('Please enter a task!'); // Замена "Заполните поле" на английский
                return;
            }
            const reminderTime = reminderInput.value || null;
            const newTask = {
                text: taskText,
                completed: false,
                reminder: reminderTime
            };
            tasks.push(newTask);
            console.log('Task added:', newTask); // Отладка: задача добавлена
            saveTasks();
            renderTasks();
            setupReminders();
            taskInput.value = '';
            reminderInput.value = '';
            reminderInput.style.display = 'none';
        });
    } else {
        console.error('Task form not found'); // Отладка: форма не найдена
    }

    // Показ мотивирующего сообщения и анимации хлопушки
    function showMotivationMessage() {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        if (motivationToast) {
            motivationToast.textContent = randomMessage;
            motivationToast.classList.remove('fade-out');
            motivationToast.classList.add('show');
            setTimeout(() => {
                motivationToast.classList.add('fade-out');
                setTimeout(() => motivationToast.classList.remove('show'), 500); // Убираем класс после анимации
            }, 5000); // 5 секунд
            console.log('Motivation message shown:', randomMessage); // Отладка: мотивационное сообщение
        } else {
            console.error('Motivation toast not found'); // Отладка: тост не найден
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
            setTimeout(() => confettiContainer.innerHTML = '', 2000); // 2 секунды
            console.log('Confetti animation triggered'); // Отладка: анимация хлопушки
        } else {
            console.error('Confetti container not found'); // Отладка: контейнер хлопушки не найден
        }
    }

    // Рендер задач
    function renderTasks() {
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.style.animation = 'slideIn 0.3s ease-out';
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
                            console.warn('Invalid reminder date for task:', task); // Отладка: некорректная дата
                        }
                    } catch (e) {
                        console.error('Error parsing reminder date:', e); // Отладка: ошибка парсинга даты
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
                    console.log('Task completed:', tasks[index]); // Отладка: задача завершена
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                    console.log('Task deleted:', index); // Отладка: задача удалена
                };

                li.append(taskContent, completeBtn, deleteBtn);
                taskList.appendChild(li);
            });
            console.log('Tasks rendered:', tasks); // Отладка: задачи отрендерены
        } else {
            console.error('Task list not found'); // Отладка: список задач не найден
        }
    }

    // Сохранение в LocalStorage
    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            console.log('Tasks saved:', tasks); // Отладка: задачи сохранены
        } catch (e) {
            console.error('Error saving tasks to LocalStorage:', e); // Отладка: ошибка сохранения задач
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
                                console.log('Reminder triggered:', task.text); // Отладка: напоминание сработало
                            }
                        }, reminderTime - now);
                    }
                } catch (e) {
                    console.error('Error setting up reminder:', e); // Отладка: ошибка настройки напоминания
                }
            }
        });
    }
});