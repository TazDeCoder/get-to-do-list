"use strict";

class ChecklistView {
  _data;
  _parentEl = document.querySelector(".aside--top");
  _list = document.querySelector(".aside__list");

  constructor() {
    this._parentEl.addEventListener("click", this._toggleParent);
    this._parentEl.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
  }

  _toggleParent() {
    this.classList.toggle("aside--expand");
  }

  _clearList() {
    this._list.innerHTML = "";
  }

  _generateMarkup() {
    return this._data.map((task) => this._generateMarkupTask(task)).join("");
  }

  _generateMarkupTask(task) {
    return `
      <li class="list__item" data-id="${task.id}">
        <p class="list__label">${task.title} - ${task.desc}</p>
        <input class="list__input list__input--checkbox" type="checkbox"></input>
      </li>
    `;
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const currElements = Array.from(this._list.querySelectorAll("*"));

    if (Array.isArray(data) && data.length === 0) return this._clearList();

    newElements.forEach((newEl, i) => {
      const currEl = currElements[i];
      // Updates changed text
      if (
        !newEl.isEqualNode(currEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      )
        currEl.textContent = newEl.textContent;
    });
  }

  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    this._list.insertAdjacentHTML("afterbegin", markup);
  }

  addHandlerTaskDrag(handler) {
    this._list.addEventListener("drop", function (e) {
      e.preventDefault();
      const id = e.dataTransfer.getData("text");
      // Checking if task already exists
      const node = [...this.children].find((item) => (item.id = id));
      if (node) return;
      handler(id);
    });
  }

  addHandlerTaskInput(handler) {
    this._list.addEventListener("input", function (e) {
      e.preventDefault();
      const input = e.target.closest(".list__input--checkbox");
      if (!input.checked) return;
      const listItem = e.target.closest(".list__item");
      const data = listItem.dataset.id;
      handler(data);
    });
  }
}

export default new ChecklistView();
