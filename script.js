const STORAGE_KEY = "fullmoon.pocketplanner.tasklog";
const logGrid = document.getElementById("logGrid");
const monthName = document.getElementById("monthName");
const yearName = document.getElementById("yearName");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

let currentDate = new Date();
const MAX_CHARS = 65;


function notifyDashboardSync() {
  if (window.parent !== window) {
    window.parent.postMessage(
      {
        type: "plannerChanged",
        planner: STORAGE_KEY,
      },
      "*",
    );
  }
}

function loadData() {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  );

  return saved?.data || {};
}

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      data,
      updatedAt: Date.now(),
    }),
  );

  notifyDashboardSync();
}

let saveTimer;

function queueSave(data) {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    saveData(data);
  }, 1000);
}

/* CARET HELPER */
function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

/* RENDER MONTH */
function renderMonth(date) {
  logGrid.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  monthName.textContent = date.toLocaleString("default", { month: "long" });
  yearName.textContent = year;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const midpoint = Math.ceil(daysInMonth / 2);

  const leftColumn = document.createElement("div");
  leftColumn.className = "month-column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "month-column";

  logGrid.appendChild(leftColumn);
  logGrid.appendChild(rightColumn);

  for (let day = 1; day <= daysInMonth; day++) {
    const rowDate = new Date(year, month, day);
    const today = new Date();
    const plannerData = loadData();

    const row = document.createElement("div");
    row.className = "log-row";

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      row.classList.add("today");
    }

    const key =`${year}-${month + 1}-${day}`;

const inputValue =
plannerData[key] || "";

    row.innerHTML = `
      <div class="log-week">${rowDate
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase()}</div>
      <div class="log-date">${day}</div>
      <div class="log-input" contenteditable="true" spellcheck="false"></div>
    `;

    const input = row.querySelector(".log-input");
    input.textContent = inputValue;

    /* BLOCK ENTER */
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });

    /* SAFE INPUT HANDLING */
    input.addEventListener("input", () => {
      let text = input.textContent;

      // Remove newlines (paste-safe)
      if (text.includes("\n")) {
        text = text.replace(/\n/g, " ");
        input.textContent = text;
        placeCaretAtEnd(input);
      }

      // Limit length
      if (text.length > MAX_CHARS) {
        input.textContent = text.slice(0, MAX_CHARS);
        placeCaretAtEnd(input);
      }

      plannerData[key] = input.textContent;
      queueSave(plannerData);
    });

    if ([0, 6].includes(rowDate.getDay())) {
      row.classList.add("weekend");
    }

    if (day <= midpoint) {
      leftColumn.appendChild(row);
    } else {
      rightColumn.appendChild(row);
    }
  }
}

/* BUTTON NAV */
prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMonth(currentDate);
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderMonth(currentDate);
};

/* SWIPE SUPPORT */
let touchStartX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 60) {
    diff < 0
      ? currentDate.setMonth(currentDate.getMonth() + 1)
      : currentDate.setMonth(currentDate.getMonth() - 1);
    renderMonth(currentDate);
  }
});

/* INIT */
renderMonth(currentDate);

const todayBtn = document.getElementById("todayBtn");

todayBtn.onclick = () => {
  currentDate = new Date();
  renderMonth(currentDate);
};
