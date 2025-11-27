(() => {
  const logEl = document.getElementById('log');
  const sendBtn = document.getElementById('sendBtn');
  const autoBtn = document.getElementById('autoBtn');
  const textEl = document.getElementById('text');
  const tagEl = document.getElementById('tag');

  function log(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.textContent = line + '\n' + logEl.textContent;
  }

  async function sendOnce(payload) {
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        log('Sent: ' + JSON.stringify(payload));
      } else {
        log('Error: ' + JSON.stringify(json));
      }
    } catch (err) {
      log('Fetch error: ' + String(err));
    }
  }

  sendBtn.addEventListener('click', () => {
    const payload = { text: textEl.value || '', tag: (tagEl.value || '') };
    sendOnce(payload);
  });

  let autoInterval = null;
  autoBtn.addEventListener('click', () => {
    if (!autoInterval) {
      autoBtn.textContent = 'Stop auto';
      autoInterval = setInterval(() => {
        const sampleText = textEl.value || `message ${Math.floor(Math.random()*1000)}`;
        const sampleTag = tagEl.value || 'demo';
        sendOnce({ text: sampleText, tag: sampleTag });
      }, 1000);
    } else {
      clearInterval(autoInterval);
      autoInterval = null;
      autoBtn.textContent = 'Start auto (1/s)';
    }
  });

})();
