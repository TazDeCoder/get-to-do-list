"use strict";

class MenuView {
  _data;
  _popup;
  _parentEl = document.querySelector(".menu");
  _content = document.querySelector(".menu__content");

  constructor() {
    this._parentEl.addEventListener("click", this._shrinkParent.bind(this));
  }

  _clearContent() {
    this._content.innerHTML = "";
  }

  _shrinkParent(e) {
    const clicked = e.target.closest(".content__item");
    if (!clicked) return;
    this._popup.classList.add("hidden");
    this._parentEl.classList.add("menu--shrink");
  }

  _generateMarkup() {
    return this._data
      .map((project) => {
        return `
          <div class="content__item" data-id="${project.id}" style="background-color: ${project.color}">
            <p class="content__header">${project.title}</p>
          </div>
        `;
      })
      .join("");
  }

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clearContent();
    this._content.insertAdjacentHTML("afterbegin", markup);
  }

  renderPopup() {
    const markup = `
      <div class="popup popup--menu">
        <h2 class="popup__header">Hey, there!</h2>
        <div class="popup__text">
          <p>Create or click on a project to get started</p>
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
