// ✅ Check login
const username = localStorage.getItem("loggedInUser");
if (!username) {
  window.location.href = "login.html";
} else {
  document.getElementById("welcome-msg").textContent = `Welcome, ${username}!`;
}

// ✅ Select elements
const taskInput = document.getElementById("task-input");
const taskDeadline = document.getElementById("task-deadline");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const historyList = document.getElementById("history-list");
const yourTasksTitle = document.getElementById("your-tasks-title");
const historyTitle = document.getElementById("task-history-title");
const userMenu = document.getElementById("user-menu");
const changePasswordOption = document.getElementById("change-password-option");
const logoutOption = document.getElementById("logout-option");

// ✅ Change Password Popup Elements
const changePasswordPopup = document.getElementById("change-password-popup");
const closeChangePassword = document.getElementById("close-change-password");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const savePasswordBtn = document.getElementById("save-password-btn");

// ✅ Load saved data
let allTasks = JSON.parse(localStorage.getItem("tasks")) || {};
let allHistory = JSON.parse(localStorage.getItem("history")) || {};
let allUsers = JSON.parse(localStorage.getItem("users")) || {};

let tasks = allTasks[username] || [];
let history = allHistory[username] || [];

// ✅ Render existing data
renderLists();

// ✅ Add new task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const deadline = taskDeadline.value;

  if (!text) return alert("Please enter a task!");
  if (!deadline) return alert("Please select a deadline!");
  if (tasks.some(t => t.text === text)) return alert("Task already exists!");

  tasks.push({ text, deadline });
  updateLocalStorage();
  renderLists();

  taskInput.value = "";
  taskDeadline.value = "";
});

// ✅ Add Task to DOM
function addTaskToDOM(text, deadline) {
  const li = document.createElement("li");
  li.classList.add("task-item");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");

  const taskName = document.createElement("span");
  taskName.textContent = text;
  taskName.classList.add("task-text");

  const deadlineDisplay = document.createElement("span");
  deadlineDisplay.classList.add("deadline");
  deadlineDisplay.textContent = "⏰ " + new Date(deadline).toLocaleString();

  const remaining = document.createElement("span");
  remaining.classList.add("remaining-time");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.classList.add("delete-btn");

  li.append(checkbox, taskName, deadlineDisplay, remaining, deleteBtn);
  taskList.appendChild(li);

  // ⏳ Timer logic
  const updateTime = () => {
    const now = new Date();
    const diff = new Date(deadline) - now;

    if (diff <= 0) {
      remaining.textContent = "🚨 Time’s up!";
      remaining.style.color = "red";
      clearInterval(interval);
      setTimeout(() => moveToHistory(text, deadline, false), 2000);
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    remaining.textContent = `⏳ ${h}h ${m}m ${s}s left`;
  };

  updateTime();
  const interval = setInterval(updateTime, 1000);

  // ✅ Checkbox → move to history
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      clearInterval(interval);
      moveToHistory(text, deadline, true);
    }
  });

  // ❌ Delete
  deleteBtn.addEventListener("click", () => {
    clearInterval(interval);
    li.remove();
    tasks = tasks.filter(t => t.text !== text);
    updateLocalStorage();
  });
}

// ✅ Move to history
function moveToHistory(text, deadline, success) {
  tasks = tasks.filter(t => t.text !== text);
  history.push({ text, deadline, completed: success });
  updateLocalStorage();
  renderLists();
}

// ✅ Add to History DOM
function addHistoryToDOM(text, deadline, completed) {
  const li = document.createElement("li");
  li.classList.add("history-item");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.disabled = true;
  checkbox.checked = completed;
  checkbox.classList.add("history-checkbox");

  const taskText = document.createElement("span");
  taskText.textContent = text;
  if (completed) taskText.style.color = "green";
  else taskText.style.color = "red";

  const pastDeadline = document.createElement("span");
  pastDeadline.classList.add("past-deadline");
  pastDeadline.textContent = "🕒 " + new Date(deadline).toLocaleString();

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    li.remove();
    history = history.filter(h => h.text !== text);
    updateLocalStorage();
  });

  li.append(checkbox, taskText, pastDeadline, deleteBtn);
  historyList.appendChild(li);
}

// ✅ Render both lists
function renderLists() {
  taskList.innerHTML = "";
  historyList.innerHTML = "";
  tasks.forEach(task => addTaskToDOM(task.text, task.deadline));
  history.forEach(task => addHistoryToDOM(task.text, task.deadline, task.completed));
}

// ✅ Update storage
function updateLocalStorage() {
  allTasks[username] = tasks;
  allHistory[username] = history;
  localStorage.setItem("tasks", JSON.stringify(allTasks));
  localStorage.setItem("history", JSON.stringify(allHistory));
}

// ✅ Toggle "Your Tasks"
yourTasksTitle.addEventListener("click", () => {
  taskList.style.display = taskList.style.display === "none" ? "block" : "none";
});

// ✅ Toggle "Task History"
historyTitle.addEventListener("click", () => {
  historyList.style.display = historyList.style.display === "none" ? "block" : "none";
});

// ✅ User Menu Toggle
document.getElementById("welcome-msg").addEventListener("click", () => {
  userMenu.classList.toggle("visible");
});

// ✅ Logout
logoutOption.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
});

// ✅ Open Change Password Popup
changePasswordOption.addEventListener("click", () => {
  userMenu.classList.remove("visible");
  changePasswordPopup.classList.add("show");
});

// ✅ Close Popup
closeChangePassword.addEventListener("click", () => {
  changePasswordPopup.classList.remove("show");
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
});

// ✅ Save Password Logic
savePasswordBtn.addEventListener("click", () => {
  const current = currentPasswordInput.value.trim();
  const newPass = newPasswordInput.value.trim();
  const confirm = confirmPasswordInput.value.trim();

  if (!current || !newPass || !confirm) {
    alert("Please fill in all fields!");
    return;
  }

  if (newPass !== confirm) {
    alert("New passwords do not match!");
    return;
  }

  const user = allUsers.find(u => u.username === username);
  if (!user || user.password !== current) {
    alert("Current password is incorrect!");
    return;
  }

  user.password = newPass;
  localStorage.setItem("users", JSON.stringify(allUsers));

  alert("Password changed successfully!");
  changePasswordPopup.classList.remove("show");
});

