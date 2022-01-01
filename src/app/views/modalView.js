"use strict";

export default class ModalView {
  _overlay = document.querySelector(".overlay");

  constructor(viewName) {
    this._parentEl = document.querySelector(`.form--add-${viewName}`);
    this._window = document.querySelector(`.modal--add-${viewName}`);
    this._btnOpen = document.querySelector(`.nav__btn--add-${viewName}`);
    this._btnClose = this._window.querySelector(".modal__btn--close");
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener("click", this._showWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.hideWindow.bind(this));
    this._overlay.addEventListener("click", this.hideWindow.bind(this));
  }

  _showWindow() {
    this._overlay.classList.remove("hidden");
    this._window.classList.remove("hidden");
  }

  hideWindow() {
    this._overlay.classList.add("hidden");
    this._window.classList.add("hidden");
  }

  addHandlerSubmit(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }
}
