const logGrid = document.getElementById("logGrid");
const monthName = document.getElementById("monthName");
const yearName = document.getElementById("yearName");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

let currentDate = new Date();
const MAX_CHARS = 65;

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

  // Force rows to fit screen
  const gridHeight = logGrid.clientHeight;
  const gap = 6;
  const rowHeight = Math.floor(
    (gridHeight - gap * (daysInMonth - 1)) / daysInMonth
  );

  logGrid.style.gridTemplateRows = `repeat(${daysInMonth}, ${rowHeight}px)`;

  for (let day = 1; day <= daysInMonth; day++) {
    const rowDate = new Date(year, month, day);
    const key = `monthly-log-${year}-${month + 1}-${day}`;

    const row = document.createElement("div");
    row.className = "log-row";

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      row.classList.add("today");
    }

    const inputValue = localStorage.getItem(key) || "";

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
    input.addEventListener("keydown", e => {
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

      localStorage.setItem(key, input.textContent);
    });

    if ([0, 6].includes(rowDate.getDay())) {
            row.classList.add("weekend");
            }

    logGrid.appendChild(row);
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

document.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
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


