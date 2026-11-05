// Dates are stored as UTC ISO 8601 strings. Converting them on the server
// would use the server's time zone, so the admin pages convert them here,
// in the browser's time zone.

// <time data-local-date datetime="2024-10-01T03:15:59Z"></time>
for (const el of document.querySelectorAll("time[data-local-date]")) {
  const date = new Date(el.dateTime);
  if (!el.dateTime || isNaN(date.getTime())) {
    continue;
  }

  el.textContent = date
    .toLocaleString("de-AT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

// <input type="datetime-local" data-utc="2024-10-01T03:15:59Z">
for (const el of document.querySelectorAll("input[type=datetime-local][data-utc]")) {
  const date = new Date(el.dataset.utc);
  if (!el.dataset.utc || isNaN(date.getTime())) {
    continue;
  }

  // Shift by the local offset so the UTC ISO string reads as local time.
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  el.value = date.toISOString().slice(0, 16);
}
