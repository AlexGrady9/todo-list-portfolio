document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const reminderInput = document.getElementById('reminder-input');
    const calendarIcon = document.querySelector('.calendar-icon');
    const taskList = document.getElementById('task-list');
    const motivationToast = document.getElementById('motivation-toast');
    const themeToggle = document.getElementById('theme-toggle');
    const confettiContainer = document.getElementById('confetti-container');
    const progressBar = document.getElementById('progress-bar');

    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!"
    ];

    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
        });
    }

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        console.error('Error loading tasks from LocalStorage:', e);
    }

    renderTasks();
    setupReminders();

    if (calendarIcon) {
        calendarIcon.addEventListener('click', (e) => {
            e.preventDefault();
            reminderInput.classList.toggle('visible');
            if (reminderInput.classList.contains('visible')) {
                reminderInput.focus();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!reminderInput.contains(e.target) && !calendarIcon.contains(e.target)) {
            reminderInput.classList.remove('visible');
        }
    });

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskText = taskInput.value.trim();
            const reminderTime = reminderInput.value;
            if (taskText) {
                const newTask = {
                    text: taskText,
                    completed: false,
                    reminder: reminderTime || null
                };
                tasks.push(newTask);
                saveTasks();
                renderTasks();
                setupReminders();
                taskInput.value = '';
                reminderInput.value = '';
                reminderInput.classList.remove('visible');
            }
        });
    }

    function showMotivationMessage() {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        if (motivationToast) {
            motivationToast.textContent = randomMessage;
            motivationToast.classList.add('show');
            setTimeout(() => {
                motivationToast.classList.remove('show');
            }, 3000);
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
            setTimeout(() => {
                confettiContainer.innerHTML = '';
            }, 2000);
        }
    }

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
                    }
                }

                flatpickr("#reminder-input", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    locale: "en" // Английская локаль
});


                const completeBtn = document.createElement('button');
                completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
                completeBtn.onclick = () => {
                    tasks[index].completed = !tasks[index].completed;
                    if (tasks[index].completed) {
                        showMotivationMessage();
                    }
                    saveTasks();
                    renderTasks();
                };

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.onclick = () => {
                    const newText = prompt('Edit task:', task.text);
                    if (newText !== null && newText.trim() !== '') {
                        tasks[index].text = newText.trim();
                        saveTasks();
                        renderTasks();
                    }
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                };

                li.append(taskContent, completeBtn, editBtn, deleteBtn);
                taskList.appendChild(li);
            });

            updateProgress();
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to LocalStorage:', e);
        }
    }

    function setupReminders() {
        tasks.forEach((task) => {
            if (task.reminder && !task.completed) {
                const reminderTime = new Date(task.reminder).getTime();
                const now = Date.now();
                if (reminderTime > now) {
                    setTimeout(() => {
                        if (Notification.permission === 'granted' && !task.completed) {
                            new Notification('Task Reminder', {
                                body: task.text,
                                icon: 'https://via.placeholder.com/32'
                            });
                        }
                    }, reminderTime - now);
                }
            }
        });
    }

    // --- Прогресс-бар ---
   function updateProgress() {
    if (progressBar) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${completed} / ${total}`;

        // Эффект сияния и конфетти при 100%
        if (total > 0 && completed === total) {
            progressBar.classList.add('glow');
            triggerConfetti(); // функция для конфетти
        } else {
            progressBar.classList.remove('glow');
        }
    }
}

// Отдельная функция для конфетти
function triggerConfetti() {
    if (confettiContainer) {
        confettiContainer.innerHTML = '';
        for (let i = 0; i < 50; i++) { // больше частиц для эффекта
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`; // радужные цвета
            confettiContainer.appendChild(confetti);
        }
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 2500);
      }
    }});
