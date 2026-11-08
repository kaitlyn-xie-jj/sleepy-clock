let hour24 = localStorage.getItem('sleepyClock24') !== 'false';
let wakeUntil = 0;
const $ = (id) => document.getElementById(id);

function render() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const displayedHour = hour24 ? hour : (hour % 12 || 12);
  $('time').textContent = String(displayedHour).padStart(2, '0') + ':' +
    String(minute).padStart(2, '0') + (hour24 ? '' : hour < 12 ? ' AM' : ' PM');
  $('date').textContent = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const sleeping = hour >= 23 || hour < 7;
  const evening = hour >= 18 && hour < 23;
  document.body.className = sleeping ? '' : evening ? 'evening' : 'day';
  $('sky').className = sleeping && Date.now() > wakeUntil
    ? 'sleeping' : !sleeping && hour >= 7 && hour < 18 ? 'happy' : '';
  $('message').textContent = sleeping ? 'Past bedtime... one more tab? 💤'
    : hour < 12 ? 'Good morning, sunshine! ☀️'
      : hour < 18 ? 'You got this! ✨' : 'Time to wind down 🌙';
  $('mode').textContent = hour24 ? '24-hour clock' : '12-hour clock';
}

$('mode').addEventListener('click', () => {
  hour24 = !hour24;
  localStorage.setItem('sleepyClock24', String(hour24));
  render();
});

$('face').addEventListener('click', () => {
  wakeUntil = Date.now() + 3000;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('face').animate([
      { transform: 'rotate(-8deg)' },
      { transform: 'rotate(8deg)' },
      { transform: 'rotate(0)' }
    ], { duration: 450 });
  }
  render();
});

render();
setInterval(render, 1000);
