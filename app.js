"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerSidebar = document.querySelector(".sidebar");
const sidebarHeader = document.querySelector(".sidebar__header");
const sidebarList = document.querySelector(".sidebar__list");
const containerMenu = document.querySelector(".menu");
const menuContent = document.querySelector(".menu__content");
const modalProject = document.querySelector(".modal-project");
const modalTask = document.querySelector(".modal-task");
const overlay = document.querySelector(".overlay");
// Buttons
// --- Menu
const btnAddProject = containerMenu.querySelector(".nav__btn--add");
const btnSubmitProject = modalProject.querySelector(".form__btn--submit");
const btnCloseProject = modalProject.querySelector(".modal__btn--close");
// --- Sidebar
const btnAddTask = containerSidebar.querySelector(".nav__btn--add");
const btnSubmitTask = modalTask.querySelector(".form__btn--submit");
const btnCloseTask = modalTask.querySelector(".modal__btn--close");
const btnCloseSidebar = containerSidebar.querySelector(".nav__btn--close");
// Inputs
// --- Menu
const inputName = modalProject.querySelector(".form__input--text--name");
const inputColor = modalProject.querySelector(".form__input--color");
// --- Sidebar
const inputTitle = modalTask.querySelector(".form__input--text--title");
const inputDesc = modalTask.querySelector(".form__input--text--desc");
const inputDate = modalTask.querySelector(".form__input--date");
const inputPriority = modalTask.querySelector(".form__select--priority");

////////////////////////////////////////////////
////// Task Contructor
///////////////////////////////////////////////

class Task {
  constructor(title, desc, dueDate, priority) {
    this.title = title;
    this.desc = desc;
    this._formatDueDate(dueDate);
    this._formatPriority(priority);
  }

  _formatDueDate(dueDate) {
    const formatDate = new Date(dueDate);
    const calcDaysAhead = (date1, date2) =>
      Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
    const daysAhead = calcDaysAhead(new Date(), formatDate);
    if (daysAhead === 0) return (this.dueDate = "Today");
    if (formatDate < new Date()) return (this.dueDate = "Expired");
    if (daysAhead === 1) return (this.dueDate = "Tommorow");
    if (daysAhead > 1 && daysAhead <= 7)
      return (this.dueDate = `${daysAhead} days`);
    if (daysAhead > 7 && daysAhead <= 30)
      return (this.dueDate = `${daysAhead % 7} weeks`);
    return (this.dueDate = dueDate);
  }

  _formatPriority(priority) {
    switch (priority) {
      case "low-low":
        return (this.priority = "lightgreen");
      case "low-high":
        return (this.priority = "yellow");
      case "high-low":
        return (this.priority = "orange");
      case "high-high":
        return (this.priority = "red");
    }
  }
}

////////////////////////////////////////////////
////// Project Contructor
///////////////////////////////////////////////

class Project {
  tasks = [];
  id = String(Date.now()).slice(-10);

  constructor(name, color) {
    this.name = name;
    this.color = color;
  }

  addTask(task) {
    this.tasks.push(task);
  }
}

////////////////////////////////////////////////
////// App Architecture
///////////////////////////////////////////////

class App {
  #projects = [];
  templateProject = new Project("Default", "#0000ff");
  templateTask = new Task("Template", "Welcome!", new Date(), "low-low");

  constructor() {
    this.templateProject.addTask(this.templateTask);
    this.#projects.push(this.templateProject);
    this._renderProject(this.templateProject);
    // Add event handlers
    // --- Menu
    btnAddProject.addEventListener("click", this._showProjectForm);
    btnSubmitProject.addEventListener("click", this._newProject.bind(this));
    btnCloseProject.addEventListener("click", this._hideProjectForm);
    // --- Sidebar
    btnCloseSidebar.addEventListener("click", this._hideTasks);
    btnAddTask.addEventListener("click", this._showTaskForm.bind(this));
    btnSubmitTask.addEventListener("click", this._newTask.bind(this));
    btnCloseTask.addEventListener("click", this._hideTaskForm);
  }

  _showProjectForm() {
    modalProject.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  _hideProjectForm() {
    inputName.value = "";
    modalProject.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _newProject(e) {
    e.preventDefault();
    const name = inputName.value;
    const color = inputColor.value;
    const desc = [name, color];
    if (!name) return alert("Must specify a project name!");
    const project = new Project(...desc);
    this.#projects.push(project);
    this._renderProject(project);
    this._hideProjectForm();
  }

  _renderProject(project) {
    const html = `
    <div class="content__item" data-id="${project.id}" style="background-color: ${project.color}">
      <p class="content__header">${project.name}</p>
    </div>
    `;
    menuContent.insertAdjacentHTML("beforeend", html);
    const [menuItem] = menuContent.children;
    menuItem.addEventListener("click", this._showTasks.bind(this, menuItem));
  }

  _showTasks(div) {
    // Fade-in-out animation
    containerSidebar.classList.add("sidebar--expand");
    containerSidebar.classList.remove("hidden");
    containerMenu.classList.add("menu--shrink");
    // Find project
    const project = this.#projects.find((pro) => pro.id === div.dataset.id);
    containerSidebar.dataset.id = project.id;
    // Clear sidebar
    while (sidebarList.firstChild)
      sidebarList.removeChild(sidebarList.firstChild);
    // Display project name + tasks
    sidebarHeader.textContent = project.name;
    project.tasks.map((task) => this._renderTask(task));
  }

  _hideTasks() {
    // Fade-in-out animation
    containerSidebar.classList.remove("sidebar--expand");
    containerSidebar.classList.add("hidden");
    containerMenu.classList.remove("menu--shrink");
  }

  _showTaskForm() {
    if (!this.#projects.length)
      return alert("You have not created any projects yet!");
    modalTask.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  _hideTaskForm() {
    // prettier-ignore
    inputTitle.value = inputDesc.value = inputDate.value = inputPriority.value = "";
    modalTask.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _newTask(e) {
    e.preventDefault();
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const dueDate = inputDate.value;
    const priority = inputPriority.value;
    const properties = [title, desc, dueDate, priority];
    if (properties.some((ipt) => !ipt))
      return alert("Some fields are left empty. Please fill them in");
    const task = new Task(...properties);
    const project = this.#projects.find(
      (pro) => pro.id === containerSidebar.dataset.id
    );
    project.addTask(task);
    this._renderTask(task);
    this._hideTaskForm();
  }

  _renderTask(task) {
    const html = `
    <li class="list__item">
      <p class="list__label--banner--tag" style="background-color:${task.priority}"></p>
      <p class="list__label--text">${task.title}</p>
      <p class="list__label--banner--hero">${task.dueDate}</p>
      <p class="list__label--text">${task.desc}</p>
    </li>
    `;
    sidebarList.insertAdjacentHTML("beforeend", html);
  }
}

const app = new App();
