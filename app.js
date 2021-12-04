"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerMain = document.querySelector(".main");
const containerSidebar = document.querySelector(".sidebar");
const sidebarList = document.querySelector(".sidebar__list");
const containerMenu = document.querySelector(".menu");
const menuContent = document.querySelector(".menu__content");
const popupOnLoad = document.querySelector(".popup--onload");
const modalProject = document.querySelector(".project");
const modalTask = document.querySelector(".task");
const overlay = document.querySelector(".overlay");
// Buttons
// --- Menu
const btnModalProjectClose = modalProject.querySelector(".modal__btn--close");
const btnAddProject = containerMenu.querySelector(".nav__btn--add");
const btnSubmitProject = modalProject.querySelector(".form__btn--submit");
// --- Sidebar
const btnSidebarClose = containerSidebar.querySelector(".nav__btn--close");
const btnModalTaskClose = modalTask.querySelector(".modal__btn--close");
const btnAddTask = containerSidebar.querySelector(".nav__btn--add");
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
const labelSidebarNavHeader = containerSidebar.querySelector(".nav__header");
const labelModalTaskHeader = modalTask.querySelector(".modal__header");

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
    // Add event handlers
    window.addEventListener("load", this._onload.bind(this));
    // --- Menu
    menuContent.addEventListener("click", this._showTasks.bind(this));
    btnAddProject.addEventListener("click", this._showModalProject);
    btnSubmitProject.addEventListener("click", this._newProject.bind(this));
    btnModalProjectClose.addEventListener("click", this._hideModalProject);
    // --- Sidebar
    sidebarList.addEventListener("click", this._handleTask.bind(this));
    btnSidebarClose.addEventListener("click", this._hideTasks.bind(this));
    btnAddTask.addEventListener("click", this._showTaskForm.bind(this, "new"));
    btnModalTaskClose.addEventListener("click", this._hideTaskForm);
  }

  _onload() {
    this.templateProject.addTask(this.templateTask);
    this.#projects.push(this.templateProject);
    this._renderProject(this.templateProject);
    popupOnLoad.classList.remove("hidden");
  }

  /////////////////////////////////////
  //////////// Helper functions

  _findProject(el) {
    const project = this.#projects.find((pro) => pro.id === el.dataset.id);
    return project;
  }
  _findTask(project, el) {
    const task = project.tasks.find((task) => task.id === el.dataset.id);
    return task;
  }

  /////////////////////////////////////
  //////////// Project form

  _hideModalProject() {
    inputName.value = "";
    modalProject.classList.add("hidden");
    overlay.classList.add("hidden");
  }
  _showModalProject() {
    modalProject.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  /////////////////////////////////////
  //////////// Project interaction

  _hideTasks() {
    // Cascades sidebar
    containerSidebar.classList.remove("sidebar--expand");
    containerSidebar.classList.add("hidden");
    containerMenu.classList.remove("menu--shrink");
  }
  _showTasks(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    // Expands sidebar
    popupOnLoad.classList.add("hidden");
    containerSidebar.classList.remove("hidden");
    containerSidebar.classList.add("sidebar--expand");
    containerMenu.classList.add("menu--shrink");
    // Find project
    const project = this._findProject(clicked);
    containerSidebar.dataset.id = project.id;
    // Clear sidebar
    while (sidebarList.firstChild)
      sidebarList.removeChild(sidebarList.firstChild);
    // Display project name + tasks
    labelSidebarNavHeader.textContent = project.name;
    project.tasks.map((task) => this._renderTask(task));
  }

  /////////////////////////////////////
  //////////// Project creation

  _newProject(e) {
    e.preventDefault();
    const name = inputName.value;
    const color = inputColor.value;
    const desc = [name, color];
    if (!name) return alert("Must specify a project name!");
    const project = new Project(...desc);
    this.#projects.push(project);
    this._renderProject(project);
    this._hideModalProject();
  }
  _renderProject(project) {
    const html = `
    <div class="content__item" data-id="${project.id}" style="background-color: ${project.color}">
      <p class="content__header">${project.name}</p>
    </div>
    `;
    menuContent.insertAdjacentHTML("beforeend", html);
  }

  /////////////////////////////////////
  //////////// Task form

  _hideTaskForm() {
    modalTask.classList.add("hidden");
    overlay.classList.add("hidden");
  }
  _showTaskForm(type) {
    if (!this.#projects.length)
      return alert("You have not created any projects yet!");
    if (type === "new") {
      labelModalTaskHeader.textContent = "New Task";
      btnSubmitTask.textContent = "Create!";
      // prettier-ignore
      inputTitle.value = inputDesc.value = inputDate.value = inputPriority.value = "";
      btnSubmitTask.removeEventListener("click", this._updateTask.bind(this));
      btnSubmitTask.addEventListener("click", this._newTask.bind(this));
    }
    if (type === "edit") {
      const project = this._findProject(containerSidebar);
      const task = this._findTask(project, this.#currTask);
      labelModalTaskHeader.textContent = "Edit Task";
      btnSubmitTask.textContent = "Save Changes!";
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

  /////////////////////////////////////
  //////////// Task interaction

  _handleTask(e) {
    const clicked = e.target;
    if (!clicked) return;
    const listItem = clicked.closest(".list__item");
    if (clicked.classList.contains("list__btn--delete")) {
      const project = this._findProject(containerSidebar);
      const task = this._findTask(project, listItem);
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
    const project = this._findProject(containerSidebar);
    const task = this._findTask(project, this.#currTask);
    task._updateTask(...arr);
    this._renderTask(task, true);
    this._hideTaskForm();
  }

  /////////////////////////////////////
  //////////// Task creation

  _newTask(e) {
    // Helper functions
    const validInputs = (...ipts) => ipts.some((ipt) => !ipt);
    e.preventDefault();
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const date = inputDate.value;
    const priority = inputPriority.value;
    const arr = [title, desc, date, priority];
    // Checking for empty fields
    if (validInputs(arr))
      return alert("Some fields are left empty! Please fill them in");
    const task = new Task(...arr);
    const project = this._findProject(containerSidebar);
    project.addTask(task);
    this._renderTask(task);
    this._hideTaskForm();
  }
  _renderTask(task, edit = false) {
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
