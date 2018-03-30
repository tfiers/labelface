'use strict';

const backend = 'http://localhost:3000'
// const backend = 'https://labelback.herokuapp.com'

let labelApp = new Vue({
  el: '#label-app',
  created: function() {
    this.fetchState()
    this.setupKeybindings()
  },
  data: { 
    'events': {
      'unlabelled': [],
      'not_SWR': [],
      'SWR': [],
      'activeEvent': null,
    },
  },
  watch: {
    events: {
      handler: console.log,
    },
  },
  methods: {
    fetchState: function() {
      let _this = this
      $.getJSON(`${backend}/fetch`, function(data) {
        _this.events = data.events
        _this.loadUnlabelledEvent()
      })
    },
    loadUnlabelledEvent: function() {
      let e = this.events.unlabelled.shift()
      if (e != null) {
        this.events.activeEvent = e
      }
    },
    setupKeybindings: function() {
      let _this = this
      window.addEventListener('keyup', function(e) {
        if (e.which == 37) {
          _this.labelActiveEvent('not_SWR')
        }
        else if (e.which == 39) {
          _this.labelActiveEvent('SWR')
        }
      })
    },
    labelActiveEvent: function(label) {
      /**
       * Move the currently active event to the list specified by 'label'.
       */
      let e = this.events.activeEvent
      if (e != null) {
        this.events[label].unshift(e)
      }
      this.loadUnlabelledEvent()
    },
    unlabel: function(event, label) {
      _.pull(this.events[label], event)
      this.events.unlabelled.unshift(event)
    },
    imageSrc: (event) => {
      return `img/vignettes/${event.id}.png`
    },
  },
});
