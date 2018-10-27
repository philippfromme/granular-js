class Events {
  constructor() {
    this.listeners = [];
  }

  on(events, listener) {
    if (typeof events === 'string') {
      events = [ events ];
    }

    events.forEach(event => {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }

      this.listeners[event].push(listener);
    });
  }

  off(events, listener) {
    if (typeof events === 'string') {
      events = [ events ];
    }

    events.forEach(event => {
      if (!this.listeners[event]) {
        return;
      }

      if (this.listeners[event].indexOf(listener) !== -1) {
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
      }
    });
  }

  fire(event, context) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach(function(listener) {
      listener(context);
    });
  };
}

export default Events;
