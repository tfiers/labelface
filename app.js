'use strict';

let dummyRange = Array(1000).fill().map((v,i)=>({id: i}))

let labelApp = new Vue({
  el: '#label-app',
  data: {
    events: {
      'unlabelled': dummyRange,
      'not_SWR': [],
      'SWR': [],
      'activeEvent': null,
    },
  },
  methods: {
    imageSrc: (event) => {
      return `D:\\thesis\\data\\Vignettes\\${event.id}.png`
    },
    loadUnlabelledEvent: function() {
      let e = this.events.unlabelled.shift()
      if (e != null) {
        this.events.activeEvent = e
      }
    },
    labelActiveEvent: function(label) {
      /**
       * Move the active event to the list specified by 'label'.
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
    }
  },
  watch: {
    events: {
      // Save on backend
      // handler: updateMeshes,
    },
  },
  created: function() {
    this.loadUnlabelledEvent()

    let v = this
    window.addEventListener('keyup', function(e) {
      if (e.which == 37) {
        v.labelActiveEvent('not_SWR')
      }
      else if (e.which == 39) {
        v.labelActiveEvent('SWR')
      }
    })
  },
});
