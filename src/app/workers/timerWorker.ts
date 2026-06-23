self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'START') {
    const { endTime } = payload;
    
    // Clear any existing interval
    if (self.timerInterval) {
      clearInterval(self.timerInterval);
    }

    self.timerInterval = setInterval(() => {
      const remainingTimeMs = Math.max(0, endTime - Date.now());
      const remainingTimeSeconds = Math.ceil(remainingTimeMs / 1000);

      self.postMessage({ type: 'TICK', payload: { remainingTime: remainingTimeSeconds } });

      if (remainingTimeMs <= 0) {
        clearInterval(self.timerInterval);
        self.postMessage({ type: 'COMPLETE' });
      }
    }, 500); // Check every 500ms to be responsive and avoid missing the exact second
  } else if (type === 'STOP') {
    if (self.timerInterval) {
      clearInterval(self.timerInterval);
      self.timerInterval = null;
    }
  }
};
