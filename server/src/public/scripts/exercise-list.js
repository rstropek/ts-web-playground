const STORAGE_KEY = "ts-web-playground.exercise-progress.v1";

const STATUS_LABELS = Object.freeze({
  unmarked: "Not marked",
  working: "Working on it",
  struggling: "Struggling",
  blocked: "I don't understand",
  done: "Done",
});

const board = document.querySelector("[data-exercise-board]");

if (board) {
  const cards = Array.from(board.querySelectorAll("[data-exercise-card]"));
  const categories = Array.from(board.querySelectorAll("[data-exercise-category]"));
  const filterButtons = Array.from(board.querySelectorAll("[data-filter]"));
  const storageNote = board.querySelector("[data-storage-note]");
  const announcement = board.querySelector("[data-status-announcement]");
  const clearButton = board.querySelector("[data-clear-progress]");
  const clearDialog = board.querySelector("[data-clear-dialog]");
  const confirmClearButton = board.querySelector("[data-confirm-clear]");
  const emptyFilterMessage = board.querySelector("[data-empty-filter]");
  const progressBar = board.querySelector("[data-progress-bar]");
  const doneCount = board.querySelector("[data-done-count]");
  const exerciseCount = board.querySelector("[data-exercise-count]");

  let activeFilter = "todo";
  let progress = {};
  let storageIsAvailable = true;

  try {
    const testKey = `${STORAGE_KEY}.test`;
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    progress = readProgress();
  } catch {
    storageIsAvailable = false;
    board.classList.add("storage-unavailable");
    clearButton.disabled = true;
    storageNote.classList.add("privacy-note-warning");
    storageNote.querySelector("strong").textContent = "Progress cannot be saved in this browser";
    storageNote.querySelector("p").textContent = "You can open every exercise, but your status choices will be reset when you leave this page.";
  }

  for (const card of cards) {
    const exerciseId = card.dataset.exerciseId;
    const savedStatus = progress[exerciseId];
    setCardStatus(card, isStatus(savedStatus) ? savedStatus : "unmarked");
  }

  board.addEventListener("click", (event) => {
    const statusButton = event.target.closest("[data-status-option]");
    if (statusButton) {
      const card = statusButton.closest("[data-exercise-card]");
      const selectedStatus = statusButton.dataset.statusOption;
      if (!card || !isStatus(selectedStatus) || selectedStatus === "unmarked") {
        return;
      }

      const status = card.dataset.status === selectedStatus ? "unmarked" : selectedStatus;
      setCardStatus(card, status);
      updateStoredStatus(card.dataset.exerciseId, status);
      updateBoard();

      const title = card.querySelector(".exercise-title").textContent.trim();
      announce(
        status === "unmarked"
          ? `${title} reset to not marked.`
          : `${title} marked as ${STATUS_LABELS[status].toLowerCase()}.`,
      );
      return;
    }

    const filterButton = event.target.closest("[data-filter]");
    if (!filterButton) {
      return;
    }

    activeFilter = filterButton.dataset.filter;
    updateBoard();
  });

  clearButton.addEventListener("click", () => {
    clearDialog.showModal();
  });

  confirmClearButton.addEventListener("click", () => {
    progress = {};
    if (storageIsAvailable) {
      localStorage.removeItem(STORAGE_KEY);
    }

    for (const card of cards) {
      setCardStatus(card, "unmarked");
    }

    activeFilter = "todo";
    updateBoard();
    announce("All locally saved exercise progress was cleared.");
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    progress = readProgress();
    for (const card of cards) {
      const savedStatus = progress[card.dataset.exerciseId];
      setCardStatus(card, isStatus(savedStatus) ? savedStatus : "unmarked");
    }
    updateBoard();
  });

  updateBoard();

  function readProgress() {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return {};
    }

    try {
      const parsedValue = JSON.parse(storedValue);
      if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
        return {};
      }

      return Object.fromEntries(
        Object.entries(parsedValue).filter(([exerciseId, status]) => exerciseId && isStatus(status) && status !== "unmarked"),
      );
    } catch {
      return {};
    }
  }

  function updateStoredStatus(exerciseId, status) {
    if (!exerciseId || !storageIsAvailable) {
      return;
    }

    if (status === "unmarked") {
      delete progress[exerciseId];
    } else {
      progress[exerciseId] = status;
    }

    if (Object.keys(progress).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }

  function setCardStatus(card, status) {
    card.dataset.status = status;
    card.querySelector("[data-status-label]").textContent = STATUS_LABELS[status];
    for (const button of card.querySelectorAll("[data-status-option]")) {
      button.setAttribute("aria-pressed", String(button.dataset.statusOption === status));
    }
  }

  function updateBoard() {
    const counts = Object.fromEntries(Object.keys(STATUS_LABELS).map((status) => [status, 0]));

    for (const card of cards) {
      counts[card.dataset.status] += 1;
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "todo" && card.dataset.status !== "done") ||
        card.dataset.status === activeFilter;
      card.hidden = !matchesFilter;
    }

    for (const category of categories) {
      const categoryCards = Array.from(category.querySelectorAll("[data-exercise-card]"));
      const visibleCards = categoryCards.filter((card) => !card.hidden);
      category.hidden = visibleCards.length === 0;
      category.querySelector("[data-category-count]").textContent = String(visibleCards.length);
    }

    for (const button of filterButtons) {
      const filter = button.dataset.filter;
      const isActive = filter === activeFilter;
      let count = counts[filter] ?? 0;
      if (filter === "all") {
        count = cards.length;
      } else if (filter === "todo") {
        count = cards.length - counts.done;
      }

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      board.querySelector(`[data-filter-count="${filter}"]`).textContent = String(count);
    }

    const total = cards.length;
    doneCount.textContent = String(counts.done);
    exerciseCount.textContent = String(total);
    progressBar.max = Math.max(total, 1);
    progressBar.value = counts.done;
    progressBar.textContent = `${total === 0 ? 0 : Math.round((counts.done / total) * 100)}%`;
    emptyFilterMessage.textContent =
      activeFilter === "todo" ? "Everything is done — your to-do list is empty." : "No exercises match this filter.";
    emptyFilterMessage.hidden = cards.some((card) => !card.hidden);
    clearButton.disabled = !storageIsAvailable || Object.keys(progress).length === 0;
  }

  function announce(message) {
    announcement.textContent = message;
  }
}

function isStatus(value) {
  return typeof value === "string" && Object.hasOwn(STATUS_LABELS, value);
}
