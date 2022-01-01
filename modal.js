"use strict";

export const state = {
  project: {},
  projects: [],
  checklist: [],
};

////////////////////////////////////////////////
////// Class Contructors
///////////////////////////////////////////////

class Task {
  id = String(Date.now()).slice(-4);

  constructor(title, desc, date, priority) {
    this.title = title;
    this.desc = desc;
    this.date = date;
    this.priority = priority;
    this._formatDate(date);
    this._formatPriority(priority);
  }

  _formatDate(date) {
    let due;
    const formatDate = new Date(date);
    const calcDaysAhead = (d1, d2) =>
      Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    const daysAhead = calcDaysAhead(
      new Date().setHours(0, 0, 0, 0),
      formatDate
    );
    if (daysAhead === 0) due = "Today";
    if (formatDate < new Date().setHours(0, 0, 0, 0)) due = "Expired";
    if (daysAhead === 1) due = "Tommorow";
    if (daysAhead > 1 && daysAhead <= 13) due = `${daysAhead} days`;
    if (daysAhead > 13 && daysAhead <= 55)
      due = `${Math.round(daysAhead / 7)} weeks`;
    if (daysAhead > 55 && daysAhead <= 365)
      due = `${Math.round(daysAhead / 28)} months`;
    this.due = due ? due : date;
    return this.due;
  }

  _formatPriority(priority) {
    let color;
    switch (priority) {
      case "low-low":
        color = "lightgreen";
        break;
      case "low-high":
        color = "yellow";
        break;
      case "high-low":
        color = "orange";
        break;
      case "high-high":
        color = "red";
        break;
    }
    this.color = color ? color : "white";
    return this.color;
  }

  update(title, desc, date, priority) {
    this.title = title;
    this.desc = desc;
    this.date = date;
    this.priority = priority;
    this._formatDate(date);
    this._formatPriority(priority);
  }
}

class Project {
  tasks = [];
  id = String(Date.now()).slice(-10);

  constructor(title, color) {
    this.title = title;
    this.color = color;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(id) {
    const idx = this.tasks.findIndex((el) => el.id === id);
    if (idx > -1) this.tasks.splice(idx, 1);
  }
}

// Helper Functions

function findTask(id) {
  const task = state.project.tasks.find((task) => task.id === id);
  return task;
}

function persistProjects() {
  localStorage.setItem("projects", JSON.stringify(state.projects));
}

function persistChecklist() {
  localStorage.setItem("checklist", JSON.stringify(state.checklist));
}

////////////////////////////////////////////////
////// Export Functions
///////////////////////////////////////////////

export function findProject(id) {
  const project = state.projects.find((project) => project.id === id);
  state.project = project;
  return project;
}

export function addProject(newProject) {
  const object = new Project(newProject.title, newProject.color);
  state.projects.push(object);
  state.project = object;
  persistProjects();
}

export function restoreProjects() {
  const storage = localStorage.getItem("projects");
  if (!storage) return;
  const parsedData = JSON.parse(storage);
  parsedData.forEach((project) =>
    Object.setPrototypeOf(project, Project.prototype)
  );
  state.projects = parsedData;
}

export function addTask(newTask) {
  const object = new Task(
    newTask.title,
    newTask.desc,
    newTask.date,
    newTask.priority
  );
  state.project.addTask(object);
  persistProjects();
}

export function removeTask(id) {
  state.project.removeTask(id);
  persistProjects();
}

export function addToChecklist(id) {
  const task = findTask(id);
  state.checklist.push(task);
  persistChecklist();
}

export function updateChecklist(id) {
  const idx = state.checklist.findIndex((el) => el.id === id);
  if (idx > -1) state.checklist.splice(idx, 1);
  state.project.removeTask(id);
  persistChecklist();
}

export function restoreChecklist() {
  const storage = localStorage.getItem("checklist");
  if (!storage) return;
  const parsedData = JSON.parse(storage);
  parsedData.forEach((task) => Object.setPrototypeOf(task, Project.prototype));
  state.checklist = parsedData;
}
