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
    const progressContainer = document.getElementById('progress-container');

    
    flatpickr("#reminder-input", {
    enableTime: true,
    dateFormat: "m/d/Y h:i K",
    time_24hr: false,
    locale: "en",
    defaultDate: new Date() // Устанавливает текущую дату (09/09/2025, 08:37 PM KST)
    });

    
    // Flatpickr календарь на английском
    flatpickr("#reminder-input", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        locale: "en"
    });

    const motivationalMessages = [
        "Great job! Keep it up!",
        "You're crushing it!",
        "One step closer to your goals!",
        "Amazing work! Stay focused!",
        "You're unstoppable today!",
        "Nice one! Keep pushing forward!"
    ];

    // Theme
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        themeToggle.textContent = currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    });

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    renderTasks();
    setupReminders();

    calendarIcon.addEventListener('click', () => {
        reminderInput.classList.toggle('visible');
        if (reminderInput.classList.contains('visible')) reminderInput.focus();
    });

    document.addEventListener('click', (e) => {
        if (!reminderInput.contains(e.target) && !calendarIcon.contains(e.target)) {
            reminderInput.classList.remove('visible');
        }
    });


    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const reminderTime = reminderInput.value;
        if (!taskText) return;

        tasks.push({
            text: taskText,
            completed: false,
            reminder: reminderTime || null
        });
        saveTasks();
        renderTasks();
        setupReminders();
        taskInput.value = '';
        reminderInput.value = '';
        reminderInput.classList.remove('visible');
    });

    function showMotivationMessage() {
        const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        motivationToast.textContent = msg;
        motivationToast.classList.add('show');
        setTimeout(() => motivationToast.classList.remove('show'), 3000);
        triggerConfetti(20);
    }

    function triggerConfetti(count = 50) {
        confettiContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            c.classList.add('confetti');
            c.style.left = `${Math.random() * 100}%`;
            c.style.animationDelay = `${Math.random() * 0.5}s`;
            c.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confettiContainer.appendChild(c);
        }
        setTimeout(() => confettiContainer.innerHTML = '', 2500);
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const taskContent = document.createElement('div');
            taskContent.classList.add('task-content');
            taskContent.textContent = task.text;

            if (task.reminder) {
                const r = document.createElement('span');
                r.classList.add('reminder-time');
                const date = new Date(task.reminder);
                if (!isNaN(date)) r.textContent = `Reminder: ${date.toLocaleString('en-US', { month:'2-digit', day:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })}`;
                taskContent.appendChild(r);
            }

            const completeBtn = document.createElement('button');
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            completeBtn.onclick = () => {
                task.completed = !task.completed;
                if (task.completed) showMotivationMessage();
                saveTasks();
                renderTasks();
            };

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => {
                const t = prompt('Edit task:', task.text);
                if (t && t.trim()) task.text = t.trim();
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

            li.append(taskContent, completeBtn, editBtn, deleteBtn);
            taskList.appendChild(li);
        });

        updateProgress();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function setupReminders() {
        tasks.forEach(task => {
            if (task.reminder && !task.completed) {
                const t = new Date(task.reminder).getTime();
                const now = Date.now();
                if (t > now) setTimeout(() => {
                    if (Notification.permission === 'granted' && !task.completed) {
                        new Notification('Task Reminder', { body: task.text });
                    }
                }, t - now);
            }
        });
    }

    function updateProgress() {
        if (!progressBar || !progressContainer) return;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        if (total === 0 || completed === 0) {
            progressContainer.style.display = 'none';
            return;
        }
        progressContainer.style.display = 'block';
        const percent = Math.round((completed / total) * 100);
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${completed} / ${total}`;
        if (completed === total) triggerConfetti();
    }
});
