export const eventBus = {
  events: {},
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(l => l !== listener);
    };
  },
  emit(event, payload) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(payload));
    }
  }
};
