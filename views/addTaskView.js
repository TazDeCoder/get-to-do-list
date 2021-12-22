"use strict";

class AddTaskView {
  _data;
  _parentEl = document.querySelector(".form--add-task");
  _window = document.querySelector(".modal--add-task");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-task");
  _btnClose = this._window.querySelector(".modal__btn--close");

  constructor() {
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener("click", this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
    this._overlay.addEventListener("click", this.toggleWindow.bind(this));
  }

  toggleWindow() {
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
  }

  addHandlerAddTask(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }
}

export default new AddTaskView();
