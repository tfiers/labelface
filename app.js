'use strict';

let labelApp = new Vue({
  el: '#label-app',
  data: {
    activeEventId: null,
    // events: [
    //   {
    //     id: 266,
    //     label: 'SWR',
    //     comment: '',
    //   },
    //   {
    //     id: 267,
    //     label: null,
    //     comment: '',
    //   },
    //   {
    //     id: 268,
    //     label: null,
    //     comment: '',
    //   },
    //   {
    //     id: 269,
    //     label: 'Not SWR',
    //     comment: '',
    //   },
    // ],
    events: Array(1000).fill().map((v,i)=>({id: i, label: null})),
  },
  methods: {
    getEvent: function(id) {
      return this.events.find((event) => event.id == id)
    },
    imageSrc: (event) => {
      return `D:\\thesis\\data\\Vignettes\\${event.id}.png`
    },
    loadUnlabelledEvent: function() {
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
      if (event != null) {
        event.label = label
        this.loadUnlabelledEvent()
      }
    },
  },
  watch: {
    events: {
      // Save on backend
      // handler: updateMeshes,
    },
  },
  created: function() {
    this.loadUnlabelledEvent()

    let vm = this
    window.addEventListener('keyup', function(e) {
      if (e.which == 37) {
        vm.onLabel('Not SWR')
      }
      else if (e.which == 39) {
        vm.onLabel('SWR')
      }
    })
  },
});
