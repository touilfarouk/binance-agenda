/**
 * @class Model
 * 
 * Enhanced Task Management System Model
 */
class Model {
  #tasks;
  #categories;
  #tags;
  #subscribers;
  #statistics;
  #onTaskListChanged;

  constructor() {
    this.#subscribers = new Map();
    this.#initializeData();
  }

  get tasks() {
    return [...this.#tasks];
  }

  #initializeData() {
    try {
      // Initialize from localStorage with default values if empty
      this.#tasks = JSON.parse(localStorage.getItem('tasks')) ?? [];
      this.#categories = JSON.parse(localStorage.getItem('categories')) ?? [
        { id: 1, name: 'Work', color: '#FF5733' },
        { id: 2, name: 'Personal', color: '#33FF57' },
        { id: 3, name: 'Shopping', color: '#3357FF' }
      ];
      this.#tags = new Set(JSON.parse(localStorage.getItem('tags')) ?? ['important', 'urgent', 'later']);
      this.#updateStatistics();
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Set default values if localStorage fails
      this.#tasks = [];
      this.#categories = [];
      this.#tags = new Set();
      this.#statistics = { total: 0, completed: 0, categoryCounts: {}, tagCounts: {}, dueSoon: 0 };
    }
  }

  subscribe(event, callback) {
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new Set());
    }
    this.#subscribers.get(event).add(callback);
  }

  #notify(event, data) {
    const callbacks = this.#subscribers.get(event) ?? new Set();
    callbacks.forEach(callback => callback(data));
  }

  #commit() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
    localStorage.setItem('categories', JSON.stringify(this.#categories));
    localStorage.setItem('tags', JSON.stringify(Array.from(this.#tags)));
    this.#updateStatistics();
    this.#onTaskListChanged?.(this.#tasks);
  }

  #updateStatistics() {
    this.#statistics = {
      total: this.#tasks.length,
      completed: this.#tasks.filter(task => task.complete).length,
      categoryCounts: this.#tasks.reduce((acc, task) => {
        acc[task.categoryId] = (acc[task.categoryId] ?? 0) + 1;
        return acc;
      }, {}),
      tagCounts: this.#tasks.reduce((acc, task) => {
        task.tags?.forEach(tag => {
          acc[tag] = (acc[tag] ?? 0) + 1;
        });
        return acc;
      }, {}),
      dueSoon: this.#tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
      }).length
    };
    this.#notify('statistics-updated', this.#statistics);
  }

  bindTaskListChanged(callback) {
    this.#onTaskListChanged = callback;
  }

  addTask(taskData) {
    const task = {
      id: this.#tasks.length > 0 ? Math.max(...this.#tasks.map(t => t.id)) + 1 : 1,
      text: taskData.text,
      complete: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString()
    };

    this.#tasks.push(task);
    this.#commit();
  }

  editTask(id, text) {
    this.#tasks = this.#tasks.map(task =>
      task.id === id ? { ...task, text } : task
    );
    this.#commit();
  }

  deleteTask(id) {
    this.#tasks = this.#tasks.filter(task => task.id !== id);
    this.#commit();
  }

  toggleTask(id) {
    this.#tasks = this.#tasks.map(task =>
      task.id === id ? { ...task, complete: !task.complete } : task
    );
    this.#commit();
  }

  addCategory(name, color) {
    const category = {
      id: Math.max(...this.#categories.map(c => c.id)) + 1,
      name,
      color
    };
    this.#categories = [...this.#categories, category];
    this.#commit();
  }

  addTag(tag) {
    this.#tags.add(tag);
    this.#commit();
  }

  getTasks(filters = {}) {
    let filteredTasks = [...this.#tasks];

    if (filters.categoryId) {
      filteredTasks = filteredTasks.filter(task => task.categoryId === filters.categoryId);
    }

    if (filters.tags?.length) {
      filteredTasks = filteredTasks.filter(task => 
        filters.tags.every(tag => task.tags.includes(tag))
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(searchLower) ||
        task.notes.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= filters.dateRange.start && taskDate <= filters.dateRange.end;
      });
    }

    // Sort tasks
    const sortKey = filters.sortBy ?? 'dueDate';
    filteredTasks.sort((a, b) => {
      if (sortKey === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b[sortKey]) - new Date(a[sortKey]);
    });

    return filteredTasks;
  }

  getCategories() {
    return [...this.#categories];
  }

  getTags() {
    return Array.from(this.#tags);
  }

  getStatistics() {
    return { ...this.#statistics };
  }
}

export default Model; 