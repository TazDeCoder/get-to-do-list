"use strict";

class SidebarView {
  _data;
  _list;
  _parentEl = document.querySelector(".sidebar");
  _content = document.querySelector(".sidebar__content");
  _popup = document.querySelector(".popup--sidebar");

  constructor() {
    this._parentEl.addEventListener("click", this._handleClick.bind(this));
    this._parentEl.addEventListener("dragstart", this._handleTaskDrag);
  }

  _handleClick(e) {
    const btn = e.target.closest(".nav__btn--close");
    if (!btn) return;
    this._hideParent();
  }

  _handleTaskDrag(e) {
    const listItem = e.target.closest(".list__item");
    e.dataTransfer.setData("text", listItem.dataset.id);
  }

  _clearContent() {
    this._content.innerHTML = "";
  }

  _clearList() {
    this._list.innerHTML = "";
  }

  _showParent() {
    this._parentEl.classList.add("sidebar--expand");
    this._parentEl.classList.remove("hidden");
  }

  _hideParent() {
    this._parentEl.classList.remove("sidebar--expand");
    this._parentEl.classList.add("hidden");
  }

  _generateMarkup() {
    return `
      <h2 class="sidebar__header">${this._data.title}</h2>
      
      <h2 class="sidebar__header">Tasks</h2>

      <ul class="sidebar__list list">
        ${this._data.tasks
          .map((task) => this._generateMarkupTask(task))
          .join("")}
      </ul>
    `;
  }

  _generateMarkupTask(task) {
    return `
      <li class="list__item" data-id="${task.id}" draggable="true">
        <p class="list__label list__label--banner--tag" style="background-color:${task.color}"></p>
        <h2 class="list__label list__label--text">${task.title}</h2>
        <p class="list__label list__label--banner--hero">${task.due}</p>
        <p class="list__label list__label--text">${task.desc}</p>
        <button class="list__btn list__btn--delete">DELETE</button>
      </li>
    `;
  }

  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    this._clearContent();
    this._content.insertAdjacentHTML("afterbegin", markup);
    this._list = document.querySelector(".sidebar__list");
    this._showParent.call(this);
  }

  renderPopup() {
    const markup = `
      <div class="popup popup--sidebar">
        <h1 class="popup__header">It looks like your tasks are empty</h1>
        <div class="popup__text text">
          <p class="text__label">
            Click on the 'plus' icon above to create a new task
          </p>
          <p class="text__label">
            On top of that, you can also drag them to the checklist over on the
            right hand side
          </p>
        </div>
      </div>
    `;
    this._content.insertAdjacentHTML("afterbegin", markup);
  }

  addHandlerRemoveTask(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const listItem = e.target.closest(".list__item");
      if (!listItem) return;
      const btn = e.target.closest(".list__btn--delete");
      if (!btn) return;
      const data = listItem.dataset.id;
      handler(data);
    });
  }

  addHandlerUpdateTask(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const listItem = e.target.closest(".list__item");
      if (!listItem) return;
      const btn = e.target.closest(".list__btn--edit");
      if (!btn) return;
      const data = listItem.dataset.id;
      handler(data);
    });
  }
}

export default new SidebarView();
