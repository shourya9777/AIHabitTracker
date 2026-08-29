// Replaces utils/dateHelpers.js. The original used date-fns; since
// this is now a plain <script> served statically (no bundler), the
// same handful of helpers are reimplemented with native Date so no
// extra build tooling is required. Behaviour matches the original.
const DateHelpers = (() => {
  const pad = (n) => String(n).padStart(2, "0");

  function toKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function todayKey() {
    return toKey(new Date());
  }

  function addDays(d, n) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function dayInfo(d) {
    return { key: toKey(d), label: DOW_SHORT[d.getDay()], short: String(d.getDate()), date: d };
  }

  function last7Days() {
    const end = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(dayInfo(addDays(end, -i)));
    return days;
  }

  function last90Days() {
    const end = new Date();
    const keys = [];
    for (let i = 89; i >= 0; i--) keys.push(toKey(addDays(end, -i)));
    return keys;
  }

  // Monday-start week containing `date` (weekStartsOn: 1, matches the original)
  function weekKeysFor(date) {
    const d = new Date(date);
    const dow = d.getDay(); // 0 = Sunday
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = addDays(d, mondayOffset);
    const days = [];
    for (let i = 0; i < 7; i++) days.push(dayInfo(addDays(monday, i)));
    return days;
  }

  function weekKeys() {
    return weekKeysFor(new Date());
  }

  function prettyDate(d) {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function streakFromKeys(keys) {
    if (!keys || !keys.length) return { current: 0, longest: 0 };
    const set = new Set(keys);
    const today = todayKey();
    const yKey = toKey(addDays(new Date(), -1));
    let current = 0;
    let cursor = new Date();
    if (!set.has(today) && !set.has(yKey)) {
      current = 0;
    } else {
      if (!set.has(today)) cursor = addDays(cursor, -1);
      while (set.has(toKey(cursor))) {
        current += 1;
        cursor = addDays(cursor, -1);
      }
    }
    const sorted = [...keys].sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const k of sorted) {
      if (prev) {
        const diff = Math.round((new Date(k) - new Date(prev)) / (1000 * 60 * 60 * 24));
        run = diff === 1 ? run + 1 : 1;
      } else run = 1;
      if (run > longest) longest = run;
      prev = k;
    }
    return { current, longest };
  }

  return { toKey, todayKey, addDays, last7Days, last90Days, weekKeys, weekKeysFor, prettyDate, streakFromKeys };
})();

window.DateHelpers = DateHelpers;
