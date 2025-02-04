/**
 * @class View
 *
 * Enhanced Task Management System View
 */
import { languages } from './languages.js';

class View {
  static #THEME_ICONS = {
    dark: '🌙',
    light: '☀️'
  };

  static #PRIORITY_ICONS = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };

  #elements = {};
  #templates = {};
  #currentLang;
  #currentTasks = [];

  constructor() {
    this.#currentLang = localStorage.getItem('language') || 'en';
    this.#initializeElements();
    this.#initializeTemplates();
    this.#initializeTheme();
    this.#initializeLanguage();
  }

  #initializeElements() {
    // Main containers
    this.#elements.app = this.#getElement('#root');
    
    // Create basic structure
    this.#elements.title = this.#createElement('h1');
    this.#elements.title.textContent = 'Task Manager';
    
    // Create form with more fields
    this.#elements.form = this.#createElement('form', 'task-form');
    
    // Task input
    const inputGroup = this.#createElement('div', 'input-group');
    this.#elements.input = this.#createElement('input');
    this.#elements.input.type = 'text';
    this.#elements.input.placeholder = 'Add task';
    this.#elements.input.name = 'task';
    
    // Priority select
    this.#elements.prioritySelect = this.#createElement('select');
    this.#elements.prioritySelect.name = 'priority';
    ['low', 'medium', 'high'].forEach(priority => {
      const option = this.#createElement('option');
      option.value = priority;
      option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
      this.#elements.prioritySelect.appendChild(option);
    });

    // Due date input
    this.#elements.dueDateInput = this.#createElement('input');
    this.#elements.dueDateInput.type = 'date';
    this.#elements.dueDateInput.name = 'dueDate';

    // Submit button
    this.#elements.submitButton = this.#createElement('button');
    this.#elements.submitButton.textContent = 'Add Task';
    
    // Task list container
    this.#elements.taskList = this.#createElement('ul', 'task-list');
    
    // Create header controls container
    const headerControls = this.#createElement('div', 'header-controls');
    
    // Add language selector
    this.#elements.langSelect = this.#createElement('select', 'lang-select');
    Object.entries(languages).forEach(([code, lang]) => {
      const option = this.#createElement('option');
      option.value = code;
      option.textContent = lang.name;
      this.#elements.langSelect.appendChild(option);
    });
    this.#elements.langSelect.value = this.#currentLang;
    this.#elements.langSelect.addEventListener('change', (e) => this.#changeLanguage(e.target.value));

    // Add theme toggle button
    this.#elements.themeToggle = this.#createElement('button', 'theme-toggle');
    this.#elements.themeToggle.innerHTML = View.#THEME_ICONS.dark; // Set initial icon
    this.#elements.themeToggle.addEventListener('click', () => this.#toggleTheme());

    // Assemble header
    headerControls.append(this.#elements.langSelect, this.#elements.themeToggle);
    this.#elements.header = this.#createElement('header', 'app-header');
    this.#elements.header.append(this.#elements.title, headerControls);

    // Append form elements
    inputGroup.append(
      this.#elements.input,
      this.#elements.prioritySelect,
      this.#elements.dueDateInput,
      this.#elements.submitButton
    );
    
    this.#elements.form.append(inputGroup);
    
    // Update the main append to include header
    this.#elements.app.append(
      this.#elements.header,
      this.#elements.form,
      this.#elements.taskList
    );
  }

  #initializeTemplates() {
    this.#templates.taskTemplate = document.getElementById('task-template');
  }

  #initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.#updateThemeIcon(savedTheme);
  }

  #updateThemeIcon(theme) {
    this.#elements.themeToggle.innerHTML = View.#THEME_ICONS[theme] || View.#THEME_ICONS.dark;
  }

  #toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.#updateThemeIcon(newTheme);
  }

  #initializeLanguage() {
    document.documentElement.setAttribute('dir', languages[this.#currentLang].dir);
    this.#updateTexts();
  }

  #changeLanguage(langCode) {
    this.#currentLang = langCode;
    localStorage.setItem('language', langCode);
    document.documentElement.setAttribute('dir', languages[langCode].dir);
    this.#updateTexts();
  }

  #updateTexts() {
    const texts = languages[this.#currentLang].translations;
    
    // Update static texts
    this.#elements.title.textContent = texts.title;
    this.#elements.input.placeholder = texts.addTaskPlaceholder;
    this.#elements.submitButton.textContent = texts.addTask;
    
    // Update priority options
    Array.from(this.#elements.prioritySelect.options).forEach(option => {
      const priority = option.value;
      option.textContent = texts.priority[priority];
    });

    // Refresh tasks to update their texts
    this.displayTasks(this.#currentTasks || []);
  }

  #createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }

  #getElement(selector) {
    return document.querySelector(selector);
  }

  #formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  displayTasks(tasks) {
    this.#currentTasks = tasks;
    while (this.#elements.taskList.firstChild) {
      this.#elements.taskList.removeChild(this.#elements.taskList.firstChild);
    }

    if (tasks.length === 0) {
      const p = this.#createElement('p', 'empty-message');
      p.textContent = languages[this.#currentLang].translations.nothingTodo;
      this.#elements.taskList.append(p);
      return;
    }

    tasks.forEach(task => {
      const li = this.#createElement('li', 'task-item');
      li.id = task.id;

      // Checkbox for completion
      const checkbox = this.#createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.complete;
      checkbox.classList.add('task-checkbox');

      // Task content container
      const contentDiv = this.#createElement('div', 'task-content');
      
      // Task text
      const textSpan = this.#createElement('span', 'task-text');
      textSpan.contentEditable = true;
      textSpan.classList.add('editable');
      textSpan.textContent = task.text;
      if (task.complete) {
        textSpan.classList.add('completed');
      }

      // Task metadata
      const metadataDiv = this.#createElement('div', 'task-metadata');
      
      // Priority badge
      if (task.priority) {
        const priorityBadge = this.#createElement('span', 'priority');
        priorityBadge.classList.add(task.priority);
        priorityBadge.textContent = `${View.#PRIORITY_ICONS[task.priority]} ${task.priority}`;
        metadataDiv.append(priorityBadge);
      }

      // Due date with icon
      if (task.dueDate) {
        const dueDateSpan = this.#createElement('span', 'due-date');
        dueDateSpan.innerHTML = `📅 Due: ${this.#formatDate(task.dueDate)}`;
        metadataDiv.append(dueDateSpan);
      }

      // Delete button
      const deleteButton = this.#createElement('button', 'delete');
      deleteButton.textContent = '×';
      
      // Assemble the task item
      contentDiv.append(textSpan, metadataDiv);
      li.append(checkbox, contentDiv, deleteButton);
      this.#elements.taskList.append(li);
    });
  }

  bindAddTask(handler) {
    this.#elements.form.addEventListener('submit', event => {
      event.preventDefault();
      const text = this.#elements.input.value.trim();
      if (text) {
        handler({
          text,
          priority: this.#elements.prioritySelect.value,
          dueDate: this.#elements.dueDateInput.value
        });
        this.#elements.input.value = '';
        this.#elements.prioritySelect.value = 'medium';
        this.#elements.dueDateInput.value = '';
      }
    });
  }

  bindDeleteTask(handler) {
    this.#elements.taskList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindToggleTask(handler) {
    this.#elements.taskList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindEditTask(handler) {
    this.#elements.taskList.addEventListener('focusout', event => {
      if (event.target.className.includes('editable')) {
        const id = parseInt(event.target.closest('.task-item').id);
        const text = event.target.textContent;
        handler(id, text);
      }
    });
  }
}

export default View; 