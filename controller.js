"use strict";

////////////////////////////////////////////////
////// Importing Modules
///////////////////////////////////////////////

// Modal
import * as modal from "./modal.js";
// Views
import menuView from "./views/menuView.js";
import addProjectView from "./views/addProjectView.js";
import sidebarView from "./views/sidebarView.js";
import addTaskView from "./views/addTaskView.js";
import checklistView from "./views/checklistView.js";

////////////////////////////////////////////////
////// Control Functions
///////////////////////////////////////////////

// Helper functions
const wait = (secs) =>
  new Promise((resolve) => setTimeout(resolve, secs * 1000));

/////////////////////////////////////
//////////// Project

function controlProject(id) {
  // Find project
  const project = modal.findProject(id);
  // Render tasks on sidebar
  sidebarView.render(modal.state.project);
  if (!project.tasks.length) sidebarView.renderPopup();
}

function controlAddProject(newProject) {
  modal.addProject(newProject);
  menuView.render(modal.state.projects);
}

/////////////////////////////////////
//////////// Task

function controlAddTask(newTask) {
  modal.addTask(newTask);
  sidebarView.render(modal.state.project);
}

function controlRemoveTask(id) {
  modal.removeTask(id);
  sidebarView.render(modal.state.project);
}

/////////////////////////////////////
//////////// Checklist

function controlChecklist(id) {
  modal.addToChecklist(id);
  checklistView.render(modal.state.checklist);
}

async function controlUpdateChecklist(id) {
  modal.updateChecklist(id);
  await wait(0.5);
  checklistView.update(modal.state.checklist);
  sidebarView.render(modal.state.project);
}

function init() {
  controlAddProject({ title: "Default", color: "#0000ff" });
  menuView.renderPopup();
  // Add event handlers
  // --- MENU ---
  menuView.addHandlerProject(controlProject);
  addProjectView.addHandlerSubmit(controlAddProject);
  // --- SIDEBAR ---
  sidebarView.addHandlerRemoveTask(controlRemoveTask);
  addTaskView.addHandlerSubmit(controlAddTask);
  // --- CHECKLIST ---
  checklistView.addHandlerTaskDrag(controlChecklist);
  checklistView.addHandlerTaskInput(controlUpdateChecklist);
}

init();
