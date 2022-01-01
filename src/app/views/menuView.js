"use strict";

class MenuView {
  _data;
  _popup;
  _parentEl = document.querySelector(".menu");
  _content = document.querySelector(".menu__content");

  constructor() {
    this._parentEl.addEventListener("click", this._hidePopup.bind(this));
  }

  _clearContent() {
    this._content.innerHTML = "";
  }

  _hidePopup(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    this._popup.classList.add("hidden");
  }

  _generateMarkup() {
    return this._data
      .map((project) => {
        return `
          <div class="content__item" data-id="${project.id}" style="background-color: ${project.color}">
            <h1 class="content__label">${project.title}</h1>
          </div>
        `;
      })
      .join("");
  }

  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) return;
    this._data = data;
    const markup = this._generateMarkup();
    this._clearContent();
    this._content.insertAdjacentHTML("afterbegin", markup);
  }

  renderPopup() {
    const markup = `
      <div class="popup popup--menu">
        <h1 class="popup__label popup__label--title">Hey, there!</h1>

        <div class="popup__text">
          <p>Create a new project or select an existing project to get started</p>
        </div>
      </div>
    `;
    this._content.insertAdjacentHTML("afterbegin", markup);
    this._popup = document.querySelector(".popup--menu");
  }

  addHandlerProject(handler) {
    this._content.addEventListener("click", function (e) {
      const item = e.target.closest(".content__item");
      if (!item) return;
      const data = item.dataset.id;
      handler(data);
    });
  }
}

export default new MenuView();
