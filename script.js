document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.querySelector('.time-display');
    const progressBar = document.querySelector('.progress-bar');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const settingsIcon = document.querySelector('.settings-icon');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    const volumeIcon = document.getElementById('volumeIcon');
    const volumeMuteIcon = document.getElementById('volumeMuteIcon');

    const pomodoroTimeInput = document.getElementById('pomodoroTime');
    const shortBreakTimeInput = document.getElementById('shortBreakTime');
    const longBreakTimeInput = document.getElementById('longBreakTime');
    const pomodoroTimeValueSpan = pomodoroTimeInput.previousElementSibling.querySelector('.time-value');
    const shortBreakTimeValueSpan = shortBreakTimeInput.previousElementSibling.querySelector('.time-value');
    const longBreakTimeValueSpan = longBreakTimeInput.previousElementSibling.querySelector('.time-value');
    const autoStartBreaksInput = document.getElementById('autoStartBreaks');
    const autoStartPomodorosInput = document.getElementById('autoStartPomodoros');
    const soundNotificationsInput = document.getElementById('soundNotifications');

    let currentMode = 'pomodoro';
    let timerInterval;
    let timeLeft;
    let totalTime;
    let isTimerRunning = false;
    let pomodorosCompleted = 0;

    const defaultSettings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: true,
        autoStartPomodoros: true,
        soundNotifications: true
    };

    const modeColors = {
        pomodoro: '#007F52',
        shortBreak: '#2577AE',
        longBreak: '#6B20B0'
    };

    const modeLightTextColors = {
        pomodoro: '#A3D9C9',
        shortBreak: '#A9D6F5',
        longBreak: '#D6B9F5'
    };

    const modeGradientEndColors = {
        pomodoro: '#004C30',
        shortBreak: '#133B58',
        longBreak: '#351058'
    };

    let settings = { ...defaultSettings };

    const alarmSound = new Audio('bell.mp3');

    function playSound() {
        if (settings.soundNotifications) {
            alarmSound.play().catch(e => console.warn("Error playing sound:", e));
        }
    }

    function updateMuteStateAndIcons() {
        if (settings.soundNotifications) {
            volumeIcon.classList.remove('icon-hidden');
            volumeMuteIcon.classList.add('icon-hidden');
        } else {
            volumeIcon.classList.add('icon-hidden');
            volumeMuteIcon.classList.remove('icon-hidden');
        }
        if (soundNotificationsInput) {
            soundNotificationsInput.checked = settings.soundNotifications;
        }
    }

    function toggleHeaderMute() {
        settings.soundNotifications = !settings.soundNotifications;
        updateMuteStateAndIcons();
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        timeDisplay.textContent = formatTime(timeLeft);
        const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        document.title = `${formatTime(timeLeft)} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Timer`;
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startPauseBtn.innerHTML = '<i class="fi fi-br-pause"></i> Pause';
        resetBtn.style.display = 'inline-block';

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                playSound();
                handleTimerCompletion();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isTimerRunning) return;
        isTimerRunning = false;
        clearInterval(timerInterval);
        startPauseBtn.innerHTML = '<i class="fi fi-rr-play"></i> Start';
    }

    function resetTimer(mode = currentMode, newTotalTime) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        totalTime = newTotalTime !== undefined ? newTotalTime * 60 : settings[mode] * 60;
        timeLeft = totalTime;
        startPauseBtn.innerHTML = '<i class="fi fi-rr-play"></i> Start';
        resetBtn.style.display = 'none';
        updateDisplay();
    }

    function handleTimerCompletion() {
        if (currentMode === 'pomodoro') {
            pomodorosCompleted++;
            if (settings.autoStartBreaks) {
                const nextMode = (pomodorosCompleted % 4 === 0) ? 'longBreak' : 'shortBreak';
                switchMode(nextMode, true);
            } else {
                startPauseBtn.innerHTML = '<i class="fi fi-rr-play"></i> Start';
                resetBtn.style.display = 'none';
            }
        } else {
            if (settings.autoStartPomodoros) {
                switchMode('pomodoro', true);
            } else {
                startPauseBtn.innerHTML = '<i class="fi fi-rr-play"></i> Start';
                resetBtn.style.display = 'none';
            }
        }
    }

    function switchMode(newMode, autoStart = false) {
        currentMode = newMode;

        const newThemeColor = modeColors[newMode] || modeColors.pomodoro;
        const newActiveModeTextColor = modeLightTextColors[newMode] || modeLightTextColors.pomodoro;
        const newTitleGradientEndColor = modeGradientEndColors[newMode] || modeGradientEndColors.pomodoro;

        document.documentElement.style.setProperty('--accent-color', newThemeColor);
        document.documentElement.style.setProperty('--title-gradient-start-color', newThemeColor);
        document.documentElement.style.setProperty('--active-mode-text-color', newActiveModeTextColor);
        document.documentElement.style.setProperty('--title-gradient-end-color', newTitleGradientEndColor);

        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === newMode) {
                btn.classList.add('active');
            }
        });
        resetTimer(newMode);
        updateActiveModeIndicator();
        if (autoStart) {
            startTimer();
        }
    }

    function updateActiveModeIndicator() {
        const activeBtn = document.querySelector(`.mode-btn[data-mode='${currentMode}']`);
        const modesElement = document.querySelector('.modes');

        if (activeBtn && modesElement) {
            modesElement.style.setProperty('--indicator-left', `${activeBtn.offsetLeft}px`);
            modesElement.style.setProperty('--indicator-width', `${activeBtn.offsetWidth}px`);
        }
    }

    function openSettingsModal() {
        pomodoroTimeInput.value = settings.pomodoro;
        shortBreakTimeInput.value = settings.shortBreak;
        longBreakTimeInput.value = settings.longBreak;
        autoStartBreaksInput.checked = settings.autoStartBreaks;
        autoStartPomodorosInput.checked = settings.autoStartPomodoros;
        soundNotificationsInput.checked = settings.soundNotifications;
        updateSliderValueDisplays();

        settingsModal.classList.add('visible');
    }

    function closeSettingsModal() {
        settingsModal.classList.remove('visible');
    }

    function saveSettings() {
        settings.pomodoro = parseInt(pomodoroTimeInput.value);
        settings.shortBreak = parseInt(shortBreakTimeInput.value);
        settings.longBreak = parseInt(longBreakTimeInput.value);
        settings.autoStartBreaks = autoStartBreaksInput.checked;
        settings.autoStartPomodoros = autoStartPomodorosInput.checked;
        const oldSoundSetting = settings.soundNotifications;
        settings.soundNotifications = soundNotificationsInput.checked;

        if (oldSoundSetting !== settings.soundNotifications) {
            updateMuteStateAndIcons();
        }

        closeSettingsModal();
        resetTimer(currentMode);
    }

    function updateSliderValueDisplays() {
        pomodoroTimeValueSpan.textContent = `${pomodoroTimeInput.value} min`;
        shortBreakTimeValueSpan.textContent = `${shortBreakTimeInput.value} min`;
        longBreakTimeValueSpan.textContent = `${longBreakTimeInput.value} min`;

        pomodoroTimeValueSpan.style.color = getComputedStyle(document.documentElement).getPropertyValue('--settings-pomodoro-bright').trim();
        shortBreakTimeValueSpan.style.color = getComputedStyle(document.documentElement).getPropertyValue('--settings-short-break-bright').trim();
        longBreakTimeValueSpan.style.color = getComputedStyle(document.documentElement).getPropertyValue('--settings-long-break-bright').trim();

        const pomodoroPercentage = ((pomodoroTimeInput.value - pomodoroTimeInput.min) / (pomodoroTimeInput.max - pomodoroTimeInput.min)) * 100;
        pomodoroTimeInput.style.setProperty('--value-pomodoro', `${pomodoroPercentage}%`);

        const shortBreakPercentage = ((shortBreakTimeInput.value - shortBreakTimeInput.min) / (shortBreakTimeInput.max - shortBreakTimeInput.min)) * 100;
        shortBreakTimeInput.style.setProperty('--value-shortBreak', `${shortBreakPercentage}%`);

        const longBreakPercentage = ((longBreakTimeInput.value - longBreakTimeInput.min) / (longBreakTimeInput.max - longBreakTimeInput.min)) * 100;
        longBreakTimeInput.style.setProperty('--value-longBreak', `${longBreakPercentage}%`);
    }

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isTimerRunning) {
                 if (!confirm("Timer is running. Are you sure you want to switch modes? This will reset the current timer.")) {
                    return;
                 }
            }
            switchMode(button.dataset.mode);
        });
    });

    startPauseBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetBtn.addEventListener('click', () => resetTimer());

    settingsIcon.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    saveSettingsBtn.addEventListener('click', saveSettings);

    [pomodoroTimeInput, shortBreakTimeInput, longBreakTimeInput].forEach(input => {
        input.addEventListener('input', updateSliderValueDisplays);
    });

    soundNotificationsInput.addEventListener('change', () => {
        settings.soundNotifications = soundNotificationsInput.checked;
        updateMuteStateAndIcons();
    });

    volumeIcon.addEventListener('click', toggleHeaderMute);
    volumeMuteIcon.addEventListener('click', toggleHeaderMute);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            startPauseBtn.click();
        }
        if (e.key.toUpperCase() === 'R') {
             e.preventDefault();
            if (resetBtn.style.display !== 'none') {
                 resetBtn.click();
            }
        }
    });

    switchMode(currentMode);
    updateActiveModeIndicator();
    updateMuteStateAndIcons();
    window.addEventListener('resize', updateActiveModeIndicator);
}); 