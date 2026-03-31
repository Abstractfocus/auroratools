(function () {
  // Create toggle button
  var btn = document.createElement('button');
  btn.className = 'dark-mode-toggle';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.type = 'button';

  function applyMode(dark) {
    if (dark) {
      document.body.classList.add('dark-mode');
      btn.textContent = '\u2600'; // sun
    } else {
      document.body.classList.remove('dark-mode');
      btn.textContent = '\uD83C\uDF19'; // moon
    }
  }

  // Restore saved preference
  var saved = localStorage.getItem('dark-mode');
  applyMode(saved === 'true');

  btn.addEventListener('click', function () {
    var isDark = document.body.classList.contains('dark-mode');
    var next = !isDark;
    localStorage.setItem('dark-mode', next);
    applyMode(next);
  });

  document.body.appendChild(btn);
})();
