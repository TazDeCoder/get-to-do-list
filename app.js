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
// Labels
const labelTaskForm = modalTask.querySelector(".modal__header");

////////////////////////////////////////////////
////// Task Contructor
///////////////////////////////////////////////

class Task {
  constructor(title, desc, date, priority) {
    this.title = title;
    this.desc = desc;
    this.date = date;
    this.priority = priority;
    this._formatDate(date);
    this._formatPriority(priority);
  }

  _updateTask(title, desc, date, priority) {
    this.title = title;
    this.desc = desc;
    this.date = date;
    this.priority = priority;
    this._formatDate(date);
    this._formatPriority(priority);
  }

  _formatDate(date) {
    const formatDate = new Date(date);
    const calcDaysAhead = (d1, d2) =>
      Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    const daysAhead = calcDaysAhead(
      new Date().setHours(0, 0, 0, 0),
      formatDate
    );
    if (daysAhead === 0) return (this.due = "Today");
    if (formatDate < new Date()) return (this.due = "Expired");
    if (daysAhead === 1) return (this.due = "Tommorow");
    if (daysAhead > 1 && daysAhead <= 7)
      return (this.due = `${daysAhead} days`);
    if (daysAhead > 7 && daysAhead <= 30)
      return (this.due = `${daysAhead % 7} weeks`);
    return (this.due = date);
  }

  _formatPriority(priority) {
    switch (priority) {
      case "low-low":
        return (this.color = "lightgreen");
      case "low-high":
        return (this.color = "yellow");
      case "high-low":
        return (this.color = "orange");
      case "high-high":
        return (this.color = "red");
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
    task.id = String(Date.now()).slice(-4);
    this.tasks.push(task);
  }
  removeTask(task) {
    const index = this.tasks.indexOf(task);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
  }
}

////////////////////////////////////////////////
////// App Architecture
///////////////////////////////////////////////

class App {
  #currTask;
  #projects = [];
  templateProject = new Project("Default", "#0000ff");
  templateTask = new Task(
    "Template",
    "Welcome!",
    new Date().setHours(0, 0, 0, 0),
    "low-low"
  );

  constructor() {
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
    sidebarList.addEventListener("click", this._taskClicked.bind(this));
    btnCloseSidebar.addEventListener("click", this._hideTasks.bind(this));
    btnCreateTask.addEventListener(
      "click",
      this._showTaskForm.bind(this, "new")
    );
    btnCloseModalTask.addEventListener("click", this._hideTaskForm);
  }

  _hideProjectForm() {
    inputName.value = "";
    modalProject.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _showProjectForm() {
    modalProject.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  _showProject(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    if (clicked.classList.contains("content__item"))
      this._showTasks.call(this, clicked);
  }

  _expandSidebar() {
    // Fade-in-out animation
    sidebarLayer1.classList.add("none");
    sidebarLayer2.classList.remove("hidden");
    sidebarLayer2.classList.add("sidebar--expand");
    containerMenu.classList.add("menu--shrink");
  }

  _showTasks(div) {
    this._expandSidebar();
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
    sidebarLayer2.classList.remove("sidebar--expand");
    sidebarLayer2.classList.add("hidden");
    containerMenu.classList.remove("menu--shrink");
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

  _hideTaskForm() {
    modalTask.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _showTaskForm(type) {
    if (!this.#projects.length)
      return alert("You have not created any projects yet!");
    if (type === "new") {
      labelTaskForm.textContent = "New Task";
      btnSubmitTask.textContent = "Create!";
      // prettier-ignore
      inputTitle.value = inputDesc.value = inputDate.value = inputPriority.value = "";
      btnSubmitTask.removeEventListener("click", this._updateTask.bind(this));
      btnSubmitTask.addEventListener("click", this._newTask.bind(this));
    }
    if (type === "edit") {
      labelTaskForm.textContent = "Edit Task";
      btnSubmitTask.textContent = "Save Changes!";
      const project = this.#projects.find(
        (pro) => pro.id === sidebarLayer2.dataset.id
      );
      const task = project.tasks.find(
        (task) => task.id === this.#currTask.dataset.id
      );
      inputTitle.value = task.title;
      inputDesc.value = task.desc;
      inputDate.value = task.date;
      inputPriority.value = task.priority;
      btnSubmitTask.removeEventListener("click", this._newTask.bind(this));
      btnSubmitTask.addEventListener("click", this._updateTask.bind(this));
    }
    modalTask.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  _taskClicked(e) {
    const clicked = e.target;
    if (!clicked) return;
    const listItem = clicked.closest(".list__item");
    if (clicked.classList.contains("list__btn--delete")) {
      const project = this.#projects.find(
        (pro) => pro.id === sidebarLayer2.dataset.id
      );
      const task = project.tasks.find(
        (task) => task.id === listItem.dataset.id
      );
      project.removeTask(task);
      sidebarList.removeChild(listItem);
    }
    if (clicked.classList.contains("list__btn--edit")) {
      this.#currTask = listItem;
      this._showTaskForm("edit");
    }
  }

  _updateTask(e) {
    e.preventDefault();
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const date = inputDate.value;
    const priority = inputPriority.value;
    const arr = [title, desc, date, priority];
    const project = this.#projects.find(
      (pro) => pro.id === sidebarLayer2.dataset.id
    );
    const task = project.tasks.find(
      (task) => task.id === this.#currTask.dataset.id
    );
    task._updateTask(...arr);
    this._renderTask(task, true);
    this._hideTaskForm();
  }

  _newTask(e) {
    e.preventDefault();
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const date = inputDate.value;
    const priority = inputPriority.value;
    const arr = [title, desc, date, priority];
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

  _renderTask(task, edit) {
    const html = `
    <p class="list__label list__label--banner--tag" style="background-color:${task.color}"></p>
    <h2 class="list__label list__label--text">${task.title}</h2>
    <p class="list__label list__label--banner--hero">${task.due}</p>
    <p class="list__label list__label--text">${task.desc}</p>
    <button class="list__btn list__btn--delete">DELETE</button>
    <button class="list__btn list__btn--edit">EDIT</button>
    `;
    if (edit) {
      this.#currTask.innerHTML = html;
      return;
    }
    const listItem = document.createElement("li");
    listItem.classList.add("list__item");
    listItem.dataset.id = task.id;
    listItem.innerHTML = html;
    sidebarList.insertAdjacentElement("beforeend", listItem);
  }
}

const app = new App();
