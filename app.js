"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const checklistBox = document.querySelector(".aside--top");
const checklist = document.querySelector(".aside__list");
const containerMain = document.querySelector(".main");
const containerSidebar = document.querySelector(".sidebar");
const sidebarList = document.querySelector(".sidebar__list");
const containerMenu = document.querySelector(".menu");
const menuContent = document.querySelector(".menu__content");
const popupSidebar = document.querySelector(".popup--sidebar");
const popupOnload = document.querySelector(".popup--onload");
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

  _editTask(title, desc, date, priority) {
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
  #currListItem;
  #projects = [];
  templateProject = new Project("Default", "#0000ff");

  constructor() {
    // Add event handlers
    window.addEventListener("load", this._onload.bind(this));
    // --- Checklist
    checklistBox.addEventListener("drop", this._handleTaskDrop.bind(this));
    checklistBox.addEventListener("dragover", this._handleTaskDrop);
    checklistBox.addEventListener("input", this._handleTaskInput.bind(this));
    checklistBox.addEventListener("click", this._toggleChecklist);
    // --- Menu
    menuContent.addEventListener("click", this._showTasks.bind(this));
    btnAddProject.addEventListener("click", this._showModalProject);
    btnSubmitProject.addEventListener("click", this._newProject.bind(this));
    btnModalProjectClose.addEventListener("click", this._hideModalProject);
    // --- Sidebar
    sidebarList.addEventListener("dragstart", this._handleTaskDrag);
    sidebarList.addEventListener("click", this._handleTaskClick.bind(this));
    btnSidebarClose.addEventListener("click", this._hideTasks.bind(this));
    btnAddTask.addEventListener("click", this._showTaskForm.bind(this, "new"));
    btnModalTaskClose.addEventListener("click", this._hideTaskForm);
  }

  _onload() {
    this.#projects.push(this.templateProject);
    this._renderProject(this.templateProject);
    popupOnload.classList.remove("hidden");
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
    popupOnload.classList.add("hidden");
    modalProject.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  /////////////////////////////////////
  //////////// Project interaction

  _hideTasks() {
    // Cascades sidebar
    popupSidebar.classList.add("hidden");
    containerSidebar.classList.remove("sidebar--expand");
    containerSidebar.classList.add("hidden");
    containerMenu.classList.remove("menu--shrink");
  }
  _showTasks(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    // Expands sidebar
    popupOnload.classList.add("hidden");
    popupSidebar.classList.remove("hidden");
    containerSidebar.classList.remove("hidden");
    containerSidebar.classList.add("sidebar--expand");
    containerMenu.classList.add("menu--shrink");
    // Find project
    const project = this._findProject(clicked);
    containerSidebar.dataset.id = project.id;
    if (project.tasks.length) popupSidebar.classList.add("hidden");
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
    // type can be either "new" or "edit"
    if (!this.#projects.length)
      return alert("You have not created any projects yet!");
    popupSidebar.classList.add("hidden");
    labelModalTaskHeader.textContent = `${
      type === "new" ? "New" : "Edit"
    } Task`;
    btnSubmitTask.textContent = `${
      type === "new" ? "Create" : "Save Changes"
    }!`;
    btnSubmitTask.value = type === "new" ? "new" : "edit";
    if (type === "new") {
      // prettier-ignore
      inputTitle.value = inputDesc.value = inputDate.value = inputPriority.value = "";
    }
    if (type === "edit") {
      const project = this._findProject(containerSidebar);
      const task = this._findTask(project, this.#currListItem);
      inputTitle.value = task.title;
      inputDesc.value = task.desc;
      inputDate.value = task.date;
      inputPriority.value = task.priority;
    }
    btnSubmitTask.addEventListener("click", this._handleSubmitTask.bind(this));
    modalTask.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
  _handleSubmitTask(e) {
    e.preventDefault();
    const target = e.target;
    if (!target) return;
    if (target.value === "new") return this._newTask.call(this);
    if (target.value === "edit") return this._updateTask.call(this);
  }

  /////////////////////////////////////
  //////////// Task interaction

  _handleTaskDrag(e) {
    const listItem = e.target.closest(".list__item");
    e.dataTransfer.setData("text", listItem.dataset.id);
  }
  _handleTaskClick(e) {
    const clicked = e.target;
    if (!clicked) return;
    const listItem = clicked.closest(".list__item");
    if (clicked.classList.contains("list__btn--delete")) {
      const project = this._findProject(containerSidebar);
      const task = this._findTask(project, listItem);
      project.removeTask(task);
      sidebarList.removeChild(listItem);
      return;
    }
    if (clicked.classList.contains("list__btn--edit")) {
      this.#currListItem = listItem;
      this._showTaskForm("edit");
      return;
    }
  }
  _updateTask() {
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const date = inputDate.value;
    const priority = inputPriority.value;
    const arr = [title, desc, date, priority];
    const project = this._findProject(containerSidebar);
    const task = this._findTask(project, this.#currListItem);
    task._editTask(...arr);
    this._renderTask(task, true);
    this._hideTaskForm();
  }

  /////////////////////////////////////
  //////////// Task creation

  _newTask() {
    // Helper functions
    const validInputs = (...ipts) => ipts.every((ipt) => ipt);
    const title = inputTitle.value;
    const desc = inputDesc.value;
    const date = inputDate.value;
    const priority = inputPriority.value;
    const arr = [title, desc, date, priority];
    // Checking for empty fields
    if (!validInputs(arr))
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
      this.#currListItem.innerHTML = html;
      return;
    }
    const listItem = document.createElement("li");
    listItem.classList.add("list__item");
    listItem.dataset.id = task.id;
    listItem.draggable = true;
    listItem.innerHTML = html;
    sidebarList.insertAdjacentElement("beforeend", listItem);
  }
  _renderChecklistTask(task) {
    const html = `
    <li class="list__item" data-id="${task.id}">
      <p class="list__label">${task.title} - ${task.desc}</p>
      <input class="list__input list__input--checkbox" type="checkbox"></input>
    </li>
    `;
    checklist.insertAdjacentHTML("beforeend", html);
  }

  /////////////////////////////////////
  //////////// Checklist interaction

  _toggleChecklist() {
    checklistBox.classList.toggle("aside--expand");
  }
  _handleTaskDrop(e) {
    e.preventDefault();
    if (e.type === "drop") {
      const id = e.dataTransfer.getData("text");
      const node = [...checklist.children].find((item) => (item.id = id));
      if (node) return;
      const project = this._findProject(containerSidebar);
      const task = project.tasks.find((task) => task.id === id);
      this._renderChecklistTask(task);
    }
  }
  _handleTaskInput(e) {
    // Helper functions
    const wait = (secs) =>
      new Promise((resolve) => setTimeout(resolve, secs * 1000));
    e.preventDefault();
    const input = e.target;
    if (!input) return;
    if (input.checked) {
      const listItem = input.closest(".list__item");
      const project = this._findProject(containerSidebar);
      const task = this._findTask(project, listItem);
      project.removeTask(task);
      wait(0.7).then(() => checklist.removeChild(listItem));
      const node = [...sidebarList.children].find(
        (item) => (item.id = listItem.dataset.id)
      );
      sidebarList.removeChild(node);
    }
  }
}

const app = new App();
