const root = document.documentElement;
const btn = document.getElementById('theme-toggle');
const icon = document.getElementById('theme-icon');
const sunPath = 'M12 4V2M12 22v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z';
const moonPath = 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z';
let dark = true;
btn.addEventListener('click', () => {
  dark = !dark;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  icon.innerHTML = '<path d="' + (dark ? moonPath : sunPath) + '"/>';
});