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
    this.hideParent();
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
  }

  hideParent() {
    this._parentEl.classList.remove("sidebar--expand");
  }

  _generateMarkup() {
    return `
      <h1 class="sidebar__label sidebar__label--title">${this._data.title}</h1>

      <h2 class="sidebar__label sidebar__label--subtitle">Tasks</h2>

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
        <p class="list__label list__label--text list__label--text--title">${task.title}</p>
        <p class="list__label list__label--banner--hero">${task.due}</p>
        <p class="list__label list__label--text list__label--text--subtitle">${task.desc}</p>
        <button class="list__btn list__btn--delete btn">DELETE</button>
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
        <h1 class="popup__label popup__label--title">It looks like your tasks are empty</h1>

        <div class="popup__text">
          <p>
            Click on the plus icon above to create a new one
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
