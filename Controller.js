/**
 * @class Controller
 *
 * Enhanced Task Management System Controller
 */
class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    // Bind model with view
    this.#model.bindTaskListChanged(this.onTaskListChanged);
    
    // Bind view with model
    this.#view.bindAddTask(this.handleAddTask);
    this.#view.bindEditTask(this.handleEditTask);
    this.#view.bindDeleteTask(this.handleDeleteTask);
    this.#view.bindToggleTask(this.handleToggleTask);

    // Initial render
    this.onTaskListChanged(this.#model.tasks);
  }

  onTaskListChanged = tasks => {
    this.#view.displayTasks(tasks);
  };

  handleAddTask = text => {
    this.#model.addTask(text);
  };

  handleEditTask = (id, text) => {
    this.#model.editTask(id, text);
  };

  handleDeleteTask = id => {
    this.#model.deleteTask(id);
  };

  handleToggleTask = id => {
    this.#model.toggleTask(id);
  };
}

export default Controller; 