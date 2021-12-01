"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerMain = document.querySelector(".main");
const sidebarLayer1 = document.querySelector(".sidebar--layer--1");
const sidebarLayer2 = document.querySelector(".sidebar--layer--2");
const sidebarList = document.querySelector(".sidebar__list");
const containerMenu = document.querySelector(".menu");
const menuContent = document.querySelector(".menu__content");
const modalProject = document.querySelector(".modal-project");
const modalTask = document.querySelector(".modal-task");
const overlay = document.querySelector(".overlay");
// Buttons
// --- Menu
const btnCreateProject = containerMenu.querySelector(".nav__btn--add");
const btnCloseModalProject = modalProject.querySelector(".modal__btn--close");
const btnSubmitProject = modalProject.querySelector(".form__btn--submit");
// --- Sidebar
const sidebarNavHeader = sidebarLayer2.querySelector(".nav__header");
const btnCloseSidebar = sidebarLayer2.querySelector(".nav__btn--close");
const btnCreateTask = sidebarLayer2.querySelector(".nav__btn--add");
const btnCloseModalTask = modalTask.querySelector(".modal__btn--close");
const btnSubmitTask = modalTask.querySelector(".form__btn--submit");
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
  #mainObserver;
  #projects = [];
  templateProject = new Project("Default", "#0000ff");
  templateTask = new Task("Template", "Welcome!", new Date(), "low-low");

  constructor() {
    this.#mainObserver = new ResizeObserver(this._observeMain);
    this.#mainObserver.observe(containerMain);
    this.templateProject.addTask(this.templateTask);
    this.#projects.push(this.templateProject);
    this._renderProject(this.templateProject);
    // Add event handlers
    // --- Menu
    menuContent.addEventListener("click", this._showProject.bind(this));
    btnCreateProject.addEventListener("click", this._showProjectForm);
    btnSubmitProject.addEventListener("click", this._newProject.bind(this));
    btnCloseModalProject.addEventListener("click", this._hideProjectForm);
    // --- Sidebar
    btnCloseSidebar.addEventListener("click", this._hideTasks.bind(this));
    btnCreateTask.addEventListener("click", this._showTaskForm.bind(this));
    btnSubmitTask.addEventListener("click", this._newTask.bind(this));
    btnCloseModalTask.addEventListener("click", this._hideTaskForm);
  }

  _observeMain(entries) {
    const [entry] = entries;
    if (
      entry.contentRect.width >= 587 ||
      window.screen.width === window.innerWidth
    ) {
      containerMenu.classList.add("menu--shrink--full");
      sidebarList.removeEventListener("mouseover", this._expandTask);
      sidebarList.removeEventListener("mouseout", this._shrinkTask);
    } else {
      sidebarList.addEventListener("mouseover", this._expandTask);
      sidebarList.addEventListener("mouseout", this._shrinkTask);
    }
    if (sidebarLayer2.classList.contains("hidden")) {
      sidebarLayer1.classList.remove("hidden");
    }
  }

  _expandTask(e) {
    const target = e.target.closest(".list__item");
    if (!target) return;
    if (target.classList.contains("list__item")) {
      sidebarLayer2.classList.add("sidebar--expand--large");
      containerMenu.classList.remove("menu--shrink--large");
      containerMenu.classList.add("menu--shrink--small");
    }
  }

  _shrinkTask(e) {
    const target = e.target.closest(".list__item");
    if (!target) return;
    if (target.classList.contains("list__item")) {
      sidebarLayer2.classList.remove("sidebar--expand--large");
      containerMenu.classList.add("menu--shrink--large");
      containerMenu.classList.remove("menu--shrink--small");
    }
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

  _showProject(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    if (clicked.classList.contains("content__item"))
      this._showTasks.call(this, clicked);
  }

  _showTasks(div) {
    // Fade-in-out animation
    sidebarLayer2.classList.add("sidebar--expand--small");
    sidebarLayer2.classList.remove("hidden");
    containerMenu.classList.add("menu--shrink--large");
    sidebarLayer1.classList.add("hidden");
    // Find project
    const project = this.#projects.find((pro) => pro.id === div.dataset.id);
    sidebarLayer2.dataset.id = project.id;
    // Clear sidebar
    while (sidebarList.firstChild)
      sidebarList.removeChild(sidebarList.firstChild);
    // Display project name + tasks
    sidebarNavHeader.textContent = project.name;
    project.tasks.map((task) => this._renderTask(task));
  }

  _hideTasks() {
    // Fade-in-out animation
    sidebarLayer2.classList.remove("sidebar--expand--small");
    sidebarLayer2.classList.add("hidden");
    containerMenu.classList.remove("menu--shrink--large");
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
    const arr = [title, desc, dueDate, priority];
    // Checking for empty fields
    if (arr.some((ipt) => !ipt))
      return alert("Some fields are left empty. Please fill them in");
    const task = new Task(...arr);
    const project = this.#projects.find(
      (pro) => pro.id === sidebarLayer2.dataset.id
    );
    project.addTask(task);
    this._renderTask(task);
    this._hideTaskForm();
  }

  _renderTask(task) {
    const html = `
    <li class="list__item">
      <p class="list__label list__label--banner--tag" style="background-color:${task.priority}"></p>
      <h2 class="list__label list__label--text">${task.title}</h2>
      <p class="list__label list__label--banner--hero">${task.dueDate}</p>
      <p class="list__label list__label--text">${task.desc}</p>
      <button class="list__btn list__btn--delete">DELETE</button>
      <button class="list__btn list__btn--edit">EDIT</button>
    </li>
    `;
    sidebarList.insertAdjacentHTML("beforeend", html);
  }
}

const app = new App();
