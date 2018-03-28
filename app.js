'use strict';

let labelApp = new Vue({
  el: '#label-app',
  data: {
    activeEventId: null,
    events: [
      {
        id: 266,
        label: 'SWR',
        comment: '',
      },
      {
        id: 267,
        label: null,
        comment: '',
      },
      {
        id: 268,
        label: null,
        comment: '',
      },
      {
        id: 269,
        label: 'Not SWR',
        comment: '',
      },
    ],
  },
  methods: {
    getEvent: function(id) {
      return this.events.find((event) => event.id == id)
    },
    imageSrc: (event) => {
      return `D:\\thesis\\data\\Vignettes\\${event.id}.png`
    },
    loadUnlabeledEvent: function() {
      event = this.events.find((event) => event.label == null)
      if (event == null) {
        this.activeEventId = null
      }
      else {
        this.activeEventId = event.id
      }
    },
    onLabel: function(label) {
      event = this.getEvent(this.activeEventId)
      event.label = label
      this.loadUnlabeledEvent()
    },
  },
  watch: {
    events: {
      // Save on backend
      // handler: updateMeshes,
    },
  },
  beforeMount: function() {
    this.loadUnlabeledEvent();
  },
});
