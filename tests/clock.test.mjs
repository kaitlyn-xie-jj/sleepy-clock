import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const script = readFileSync(new URL('../clock.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../newtab.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

function mount({ hour = 12, minute = 0, savedPreference = null, reduceMotion = false } = {}) {
  let currentTime = new Date(2026, 10, 8, hour, minute).getTime();
  const storage = new Map(savedPreference === null ? [] : [['sleepyClock24', savedPreference]]);
  const nodes = new Map();
  const intervals = [];
  let animations = 0;
  for (const id of ['time', 'date', 'sky', 'message', 'mode', 'face']) {
    nodes.set(id, {
      textContent: '', className: '', listeners: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      click() { this.listeners.click(); },
      animate() { animations++; }
    });
  }
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [currentTime])); }
    static now() { return currentTime; }
  }
  const context = vm.createContext({
    Date: FakeDate,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    document: {
      body: { className: '' },
      getElementById: (id) => nodes.get(id)
    },
    window: { matchMedia: () => ({ matches: reduceMotion }) },
    setInterval: (callback) => intervals.push(callback)
  });
  vm.runInContext(script, context);
  return {
    get: (id) => nodes.get(id), storage,
    body: context.document.body,
    tick: (hour, minute = 0, milliseconds = 0) => {
      currentTime = new Date(2026, 10, 8, hour, minute).getTime() + milliseconds;
      intervals[0]();
    },
    get animations() { return animations; },
    intervals
  };
}

test('bedtime, daytime, evening, and morning boundaries update the clock mood', () => {
  const clock = mount({ hour: 6, minute: 59 });
  assert.equal(clock.get('sky').className, 'sleeping');
  assert.equal(clock.get('time').textContent, '06:59');
  clock.tick(7);
  assert.equal(clock.get('sky').className, 'happy');
  assert.equal(clock.body.className, 'day');
  clock.tick(18);
  assert.equal(clock.body.className, 'evening');
  assert.match(clock.get('message').textContent, /wind down/);
  clock.tick(23);
  assert.equal(clock.get('sky').className, 'sleeping');
  assert.equal(clock.intervals.length, 1);
});

test('12/24-hour preference toggles and persists', () => {
  const clock = mount({ hour: 0, minute: 2 });
  assert.equal(clock.get('time').textContent, '00:02');
  clock.get('mode').click();
  assert.equal(clock.get('time').textContent, '12:02 AM');
  assert.equal(clock.storage.get('sleepyClock24'), 'false');
  clock.tick(13, 9);
  assert.equal(clock.get('time').textContent, '01:09 PM');
  assert.equal(mount({ hour: 13, minute: 9, savedPreference: 'false' }).get('time').textContent, '01:09 PM');
});

test('clicking the face wakes it temporarily, then it goes back to sleep', () => {
  const clock = mount({ hour: 23, minute: 45 });
  assert.equal(clock.get('sky').className, 'sleeping');
  clock.get('face').click();
  assert.equal(clock.get('sky').className, '');
  assert.equal(clock.animations, 1);
  clock.tick(23, 45, 3001);
  assert.equal(clock.get('sky').className, 'sleeping');
});

test('reduced-motion preference disables wake animation', () => {
  const clock = mount({ hour: 23, reduceMotion: true });
  clock.get('face').click();
  assert.equal(clock.animations, 0);
  assert.equal(clock.get('sky').className, '');
});

test('the wake control is a native keyboard-operable button with visible focus', () => {
  assert.match(html, /<button\s+class="face"\s+id="face"\s+type="button"\s+aria-label="Wake up the sleepy clock">/);
  assert.match(css, /\.face:focus-visible\s*\{/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
