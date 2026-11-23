const equipment = [
  { id: "badminton-set", name: "Badminton set", category: "Sports", icon: "🏸", description: "Rackets and shuttlecocks for a casual game." },
  { id: "football", name: "Football", category: "Sports", icon: "⚽", description: "A football for practice or a friendly match." },
  { id: "volleyball-set", name: "Volleyball set", category: "Sports", icon: "🏐", description: "A ball and net for your next game." },
  { id: "table-tennis-set", name: "Table tennis set", category: "Sports", icon: "🏓", description: "Paddles and balls for a quick match." },
  { id: "training-kit", name: "Training cones & bibs", category: "Sports", icon: "🔺", description: "Set up drills and organize team practice." },
  { id: "projector", name: "Portable projector", category: "Social & events", icon: "📽️", description: "For presentations, classes and small events." },
  { id: "speaker", name: "Portable speaker", category: "Social & events", icon: "🔊", description: "A handy speaker for your next gathering." },
  { id: "microphone", name: "Wireless microphone", category: "Social & events", icon: "🎙️", description: "For talks, presentations and campus events." },
  { id: "pa-system", name: "Portable PA system", category: "Social & events", icon: "📢", description: "Clear sound for a club or faculty event." },
  { id: "laptop", name: "Laptop", category: "Computing", icon: "💻", description: "A reliable laptop for campus work and study." },
  { id: "camera", name: "Digital camera", category: "Photography", icon: "📷", description: "Capture a project, event or campus moment." },
  { id: "tablet", name: "Drawing tablet", category: "Computing", icon: "✏️", description: "A digital drawing tablet for creative work." },
];

const rooms = [
  { id: "seminar-room-a", name: "Seminar Room A", building: "Academic Building", capacity: 24, icon: "▤" },
  { id: "discussion-room", name: "Discussion Room", building: "Library", capacity: 8, icon: "▥" },
  { id: "meeting-room-2", name: "Meeting Room 2", building: "Faculty Office", capacity: 12, icon: "▤" },
];

const STORAGE_KEY = "umt-campus-service-requests";
const views = ["dashboard", "equipment", "rooms", "requests"];
const pageNames = {
  dashboard: "Dashboard",
  equipment: "Equipment",
  rooms: "Room booking",
  requests: "My requests",
};

let requests = loadRequests();
let selectedCategory = "All";

function loadRequests() {
  try {
    const savedRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedRequests) ? savedRequests : [];
  } catch (error) {
    console.warn("Could not load saved requests from this browser.", error);
    return [];
  }
}

function saveRequests() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return true;
  } catch (error) {
    console.error("Could not save your request in this browser.", error);
    return false;
  }
}

function setView(viewName) {
  const view = views.includes(viewName) ? viewName : "dashboard";

  document.querySelectorAll(".view").forEach((section) => {
    const isActive = section.id === `${view}-view`;
    section.hidden = !isActive;
    section.classList.toggle("active", isActive);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.dataset.view === view;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.getElementById("page-label").textContent = pageNames[view];
  if (window.location.hash !== `#${view}`) {
    window.history.replaceState(null, "", `#${view}`);
  }
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderEquipment() {
  const list = document.getElementById("equipment-list");
  list.replaceChildren();

  const filterText = document.getElementById("equipment-search").value.trim().toLowerCase();
  const matchingItems = equipment.filter((item) => {
    const matchesText = `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(filterText);
    return matchesText && (selectedCategory === "All" || item.category === selectedCategory);
  });

  const itemCount = matchingItems.length;
  const itemLabel = itemCount === 1 ? "item" : "items";
  const resultCount = document.getElementById("equipment-result-count");
  resultCount.textContent = selectedCategory === "All" && !filterText
    ? `${itemCount} ${itemLabel} available`
    : `Showing ${itemCount} ${selectedCategory === "All" ? "matching" : selectedCategory.toLowerCase()} ${itemLabel}`;
  document.getElementById("clear-equipment-filters").hidden =
    selectedCategory === "All" && !filterText;

  if (matchingItems.length === 0) {
    list.append(createEmptyState("No equipment found", "Try another search or category."));
    return;
  }

  matchingItems.forEach((item) => {
    const card = makeElement("article", "equipment-card");
    const top = makeElement("div", "equipment-card-top");
    top.append(
      makeElement("span", "item-illustration", item.icon),
      makeElement("span", "availability", "Available"),
    );

    card.append(top, makeElement("h3", "", item.name), makeElement("p", "", item.description));
    const footer = makeElement("div", "equipment-card-footer");
    footer.append(makeElement("span", "category-tag", item.category));

    const button = makeElement("button", "small-button", "Request item");
    button.type = "button";
    button.addEventListener("click", () => openEquipmentRequest(item));
    footer.append(button);
    card.append(footer);
    list.append(card);
  });
}

function renderRooms() {
  const list = document.getElementById("room-list");
  const roomChoice = document.getElementById("room-choice");
  list.replaceChildren();
  roomChoice.replaceChildren();

  rooms.forEach((room) => {
    const card = makeElement("article", "room-card");
    const top = makeElement("div", "room-card-top");
    top.append(
      makeElement("span", "room-icon", room.icon),
      makeElement("span", "room-capacity", `Up to ${room.capacity} people`),
    );
    card.append(
      top,
      makeElement("h3", "", room.name),
      makeElement("p", "", room.building),
      makeElement("span", "availability", "Request to book"),
    );
    list.append(card);

    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = `${room.name} — ${room.building}`;
    roomChoice.append(option);
  });
}

function createEmptyState(title, message) {
  const empty = makeElement("div", "empty-state");
  empty.append(makeElement("strong", "", title), makeElement("span", "", message));
  return empty;
}

function createRequestRow(request) {
  const row = makeElement("article", "request-row");
  const nameColumn = makeElement("div");
  const requestDetail = `${request.name} · ${request.role}${request.purpose ? ` · ${request.purpose}` : ""}`;
  nameColumn.append(
    makeElement("div", "request-name", request.item),
    makeElement("div", "request-detail", requestDetail),
  );

  let details = "Date not specified";
  if (request.date && request.returnDate) {
    details = `${request.date} → ${request.returnDate}`;
  } else if (request.date) {
    details = `${request.date}${request.time ? ` · ${request.time}` : ""}`;
  }
  row.append(
    nameColumn,
    makeElement("span", "request-type", request.type),
    makeElement("span", "request-type", details),
    makeElement("span", "status-pill", request.status),
  );
  return row;
}

function renderRequests() {
  const recent = document.getElementById("recent-requests");
  const all = document.getElementById("all-requests");
  recent.replaceChildren();
  all.replaceChildren();

  const newestFirst = [...requests].reverse();
  const recentRequests = newestFirst.slice(0, 3);

  if (recentRequests.length === 0) {
    recent.append(createEmptyState("Nothing here just yet", "Your recent requests will show up here."));
  } else {
    recentRequests.forEach((request) => recent.append(createRequestRow(request)));
  }

  if (newestFirst.length === 0) {
    all.append(createEmptyState("No requests yet", "When you request equipment or a room, you will find it here."));
  } else {
    newestFirst.forEach((request) => all.append(createRequestRow(request)));
  }

  document.getElementById("request-count").textContent = requests.length;
  document.getElementById("my-request-count").textContent = requests.length;
}

function addRequest(request) {
  requests.push({
    ...request,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: "Pending",
  });

  if (!saveRequests()) {
    requests.pop();
    return false;
  }

  renderRequests();
  return true;
}

function openEquipmentRequest(item) {
  const form = document.getElementById("equipment-form");
  form.reset();
  document.getElementById("equipment-item").value = item.name;
  document.getElementById("equipment-dialog-item").textContent = item.name;
  document.getElementById("equipment-message").textContent = "";
  setMinimumDates();
  document.getElementById("equipment-dialog").showModal();
}

function setMinimumDates() {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = localToday;
  });
}

document.querySelectorAll("[data-view]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setView(link.dataset.view);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.go));
});

document.getElementById("equipment-search").addEventListener("input", () => {
  renderEquipment();
});

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((categoryButton) => {
      categoryButton.setAttribute(
        "aria-pressed",
        String(categoryButton.dataset.category === selectedCategory),
      );
    });
    renderEquipment();
  });
});

document.getElementById("clear-equipment-filters").addEventListener("click", () => {
  selectedCategory = "All";
  document.getElementById("equipment-search").value = "";
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === "All"));
  });
  renderEquipment();
});

document.getElementById("room-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const request = {
    type: "Room booking",
    item: formData.get("item"),
    name: formData.get("name").trim(),
    role: formData.get("role"),
    date: formData.get("date"),
    time: formData.get("time"),
    purpose: formData.get("purpose").trim(),
  };

  if (!addRequest(request)) {
    document.getElementById("room-message").textContent = "Could not save your request. Please try again.";
    return;
  }

  form.reset();
  document.getElementById("room-message").textContent = "Your room request has been saved as pending.";
  setMinimumDates();
});

document.getElementById("close-equipment-dialog").addEventListener("click", () => {
  document.getElementById("equipment-dialog").close();
});

document.getElementById("equipment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const request = {
    type: "Equipment",
    item: formData.get("item"),
    name: formData.get("name").trim(),
    role: formData.get("role"),
    date: formData.get("date"),
    returnDate: formData.get("returnDate"),
  };

  if (!addRequest(request)) {
    document.getElementById("equipment-message").textContent = "Could not save your request. Please try again.";
    return;
  }

  document.getElementById("equipment-dialog").close();
  form.reset();
});

document.querySelector('#equipment-form input[name="date"]').addEventListener("change", (event) => {
  document.querySelector('#equipment-form input[name="returnDate"]').min = event.target.value;
});

document.getElementById("today-date").textContent = new Intl.DateTimeFormat("en-MY", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

document.getElementById("available-count").textContent = equipment.length;
document.getElementById("room-count").textContent = rooms.length;
document.querySelectorAll("[data-count-for]").forEach((count) => {
  const category = count.dataset.countFor;
  const total = category === "All"
    ? equipment.length
    : equipment.filter((item) => item.category === category).length;
  count.textContent = total;
});
renderEquipment();
renderRooms();
renderRequests();
setMinimumDates();

const initialView = window.location.hash.slice(1);
setView(views.includes(initialView) ? initialView : "dashboard");
