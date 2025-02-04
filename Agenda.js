class Agenda {
  #container;
  #currentDate;
  #selectedDate;
  #events = new Map();
  #onEventChange;

  constructor(container, onEventChange) {
    this.#container = container;
    this.#currentDate = new Date();
    this.#selectedDate = new Date();
    this.#onEventChange = onEventChange;
    this.#loadEvents();
    this.render();
  }

  #loadEvents() {
    const savedEvents = localStorage.getItem('agenda-events');
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      events.forEach(event => {
        this.#events.set(event.id, {
          ...event,
          date: new Date(event.date)
        });
      });
    }
  }

  #saveEvents() {
    const events = Array.from(this.#events.values());
    localStorage.setItem('agenda-events', JSON.stringify(events));
    this.#onEventChange?.(events);
  }

  addEvent(title, date, description = '') {
    const id = Date.now();
    this.#events.set(id, {
      id,
      title,
      date: new Date(date),
      description,
      completed: false
    });
    this.#saveEvents();
    this.render();
  }

  updateEvent(id, updates) {
    const event = this.#events.get(id);
    if (event) {
      this.#events.set(id, {
        ...event,
        ...updates,
        date: updates.date ? new Date(updates.date) : event.date
      });
      this.#saveEvents();
      this.render();
    }
  }

  deleteEvent(id) {
    this.#events.delete(id);
    this.#saveEvents();
    this.render();
  }

  render() {
    this.#container.innerHTML = `
      <div class="agenda">
        <div class="agenda-header">
          <button class="prev-month">←</button>
          <h2>${this.#currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button class="next-month">→</button>
        </div>
        <div class="calendar">
          ${this.#renderCalendar()}
        </div>
        <div class="events-list">
          <h3>Events for ${this.#selectedDate.toLocaleDateString()}</h3>
          ${this.#renderEvents()}
        </div>
        <div class="add-event">
          <h3>Add Event</h3>
          <form class="event-form">
            <input type="text" name="title" placeholder="Event title" required>
            <textarea name="description" placeholder="Description"></textarea>
            <input type="datetime-local" name="date" required>
            <button type="submit">Add Event</button>
          </form>
        </div>
      </div>
    `;

    this.#attachEventListeners();
  }

  #renderCalendar() {
    const year = this.#currentDate.getFullYear();
    const month = this.#currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let calendar = `
      <div class="calendar-grid">
        <div class="weekday">Sun</div>
        <div class="weekday">Mon</div>
        <div class="weekday">Tue</div>
        <div class="weekday">Wed</div>
        <div class="weekday">Thu</div>
        <div class="weekday">Fri</div>
        <div class="weekday">Sat</div>
    `;

    for (let i = 0; i < startingDay; i++) {
      calendar += '<div class="day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasEvents = Array.from(this.#events.values()).some(
        event => event.date.toDateString() === date.toDateString()
      );
      const isSelected = date.toDateString() === this.#selectedDate.toDateString();
      calendar += `
        <div class="day ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''}" 
             data-date="${date.toISOString()}">
          ${day}
          ${hasEvents ? '<span class="event-indicator">•</span>' : ''}
        </div>
      `;
    }

    return calendar + '</div>';
  }

  #renderEvents() {
    const dayEvents = Array.from(this.#events.values())
      .filter(event => event.date.toDateString() === this.#selectedDate.toDateString())
      .sort((a, b) => a.date - b.date);

    if (dayEvents.length === 0) {
      return '<p class="no-events">No events for this day</p>';
    }

    return `
      <div class="events">
        ${dayEvents.map(event => `
          <div class="event ${event.completed ? 'completed' : ''}" data-id="${event.id}">
            <div class="event-header">
              <input type="checkbox" ${event.completed ? 'checked' : ''}>
              <h4>${event.title}</h4>
              <button class="delete-event">×</button>
            </div>
            <p class="event-time">${event.date.toLocaleTimeString()}</p>
            <p class="event-description">${event.description}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  #attachEventListeners() {
    // Navigation
    this.#container.querySelector('.prev-month').addEventListener('click', () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
      this.render();
    });

    this.#container.querySelector('.next-month').addEventListener('click', () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
      this.render();
    });

    // Day selection
    this.#container.querySelectorAll('.day:not(.empty)').forEach(day => {
      day.addEventListener('click', () => {
        this.#selectedDate = new Date(day.dataset.date);
        this.render();
      });
    });

    // Add event form
    const form = this.#container.querySelector('.event-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      this.addEvent(
        formData.get('title'),
        formData.get('date'),
        formData.get('description')
      );
      form.reset();
    });

    // Event actions
    this.#container.querySelectorAll('.event').forEach(eventEl => {
      const id = parseInt(eventEl.dataset.id);
      
      // Toggle completion
      eventEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        this.updateEvent(id, { completed: e.target.checked });
      });

      // Delete event
      eventEl.querySelector('.delete-event').addEventListener('click', () => {
        this.deleteEvent(id);
      });
    });
  }
}

export default Agenda; 