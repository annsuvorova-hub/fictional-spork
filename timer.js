class AnimatedTimer {
  constructor() {
    this.minutesInput = document.getElementById("minutesInput");
    this.startBtn = document.getElementById("startBtn");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.timeDisplay = document.getElementById("timeDisplay");
    this.statusDisplay = document.getElementById("statusDisplay");
    this.progressCircle = document.getElementById("progressCircle");
    this.container = document.querySelector(".timer-container");

    this.totalSeconds = 0;
    this.remainingSeconds = 0;
    this.timerInterval = null;
    this.isRunning = false;
    this.isPaused = false;
    this.isFinished = false;
    this.circumference = 816.81;

    this.init();
  }

  init() {
    this.progressCircle.style.strokeDasharray = this.circumference;
    this.progressCircle.style.strokeDashoffset = this.circumference;

    this.updateTimeDisplay(0);
    this.updateStatus("Готов");
    this.updateButtons();

    this.startBtn.addEventListener("click", () => this.start());
    this.pauseBtn.addEventListener("click", () => this.togglePause());
    this.resetBtn.addEventListener("click", () => this.reset());

    this.minutesInput.addEventListener("input", () => {
      let value = parseInt(this.minutesInput.value) || 0;
      if (value > 99) this.minutesInput.value = 99;
      if (value < 0) this.minutesInput.value = 0;

      if (!this.isRunning && !this.isPaused) {
        this.totalSeconds = value * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateTimeDisplay(this.totalSeconds);
        this.resetProgress();
        this.updateStatus("Готов");
      }
    });

    const initialMinutes = parseInt(this.minutesInput.value) || 5;
    this.totalSeconds = initialMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateTimeDisplay(this.totalSeconds);
  }

  start() {
    if (this.isRunning || this.isPaused) return;

    const minutes = parseInt(this.minutesInput.value) || 0;

    if (minutes <= 0) {
      this.updateStatus("Введите время");
      return;
    }

    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = true;
    this.isPaused = false;
    this.isFinished = false;
    this.container.classList.remove("finished");

    this.minutesInput.disabled = true;
    this.updateTimeDisplay(this.remainingSeconds);
    this.resetProgress();
    this.startTimer();
    this.updateStatus("Выполняется");
    this.updateButtons();
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimeDisplay(this.remainingSeconds);

      const progress = 1 - this.remainingSeconds / this.totalSeconds;
      this.updateProgress(progress);

      if (this.remainingSeconds <= 0) {
        this.finish();
      }
    }, 1000);
  }

  togglePause() {
    if (!this.isRunning || this.isFinished) return;

    if (this.isPaused) {
      // Продолжить
      this.isPaused = false;
      this.startTimer();
      this.updateStatus("Выполняется");
    } else {
      // Пауза
      this.isPaused = true;
      clearInterval(this.timerInterval);
      this.updateStatus("На паузе");
    }

    this.updateButtons();
  }

  finish() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.isPaused = false;
    this.isFinished = true;

    this.updateTimeDisplay(0);
    this.updateProgress(1);
    this.updateStatus("Завершен");

    this.container.classList.add("finished");
    this.minutesInput.disabled = false;
    this.updateButtons();

    this.playFinishSound();
  }

  reset() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.isPaused = false;
    this.isFinished = false;
    this.container.classList.remove("finished");

    const minutes = parseInt(this.minutesInput.value) || 0;
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;

    this.updateTimeDisplay(this.totalSeconds);
    this.resetProgress();
    this.updateStatus("Готов");
    this.minutesInput.disabled = false;
    this.updateButtons();
  }

  updateTimeDisplay(seconds) {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    this.timeDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  updateProgress(progress) {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const offset = this.circumference * (1 - clampedProgress);
    this.progressCircle.style.strokeDashoffset = offset;

    // Фиолетовая цветовая схема
    if (clampedProgress < 0.25) {
      this.progressCircle.style.stroke = "#7c3aed"; // Фиолетовый
    } else if (clampedProgress < 0.5) {
      this.progressCircle.style.stroke = "#8b5cf6"; // Светло-фиолетовый
    } else {
      this.progressCircle.style.stroke = "#1a1a1a"; // Черный
    }
  }

  resetProgress() {
    this.progressCircle.style.strokeDashoffset = this.circumference;
    this.progressCircle.style.stroke = "#1a1a1a";
  }

  updateStatus(text) {
    this.statusDisplay.textContent = text;
  }

  updateButtons() {
    // Кнопка Старт - всегда "Старт", не меняется
    this.startBtn.textContent = "Старт";

    // Кнопка Старт активна только когда таймер не запущен и не на паузе
    if (this.isRunning || this.isPaused) {
      this.startBtn.disabled = true;
    } else {
      this.startBtn.disabled = false;
    }

    // Кнопка Пауза
    if (
      this.isRunning &&
      !this.isPaused &&
      !this.isFinished &&
      this.remainingSeconds > 0
    ) {
      // Таймер работает - показываем "Пауза"
      this.pauseBtn.textContent = "Пауза";
      this.pauseBtn.disabled = false;
    } else if (this.isPaused && !this.isFinished) {
      // Таймер на паузе - показываем "Продолжить"
      this.pauseBtn.textContent = "Продолжить";
      this.pauseBtn.disabled = false;
    } else {
      // Все остальные случаи - Пауза недоступна
      this.pauseBtn.textContent = "Пауза";
      this.pauseBtn.disabled = true;
    }

    // После завершения - Старт активна, Пауза недоступна
    if (this.isFinished) {
      this.startBtn.disabled = false;
      this.pauseBtn.textContent = "Пауза";
      this.pauseBtn.disabled = true;
    }
  }

  playFinishSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      [523, 659, 784].forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();

          oscillator.connect(gain);
          gain.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "sine";

          gain.gain.setValueAtTime(0.15, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }, index * 150);
      });
    } catch (e) {
      // Без звука
    }
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.timer = new AnimatedTimer();
});
