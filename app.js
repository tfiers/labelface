'use strict'

let backend
if (location.hostname == '') {
  backend = 'http://localhost:3000'
}
else {
  backend = 'https://labelback.herokuapp.com'
}

moment.fn.fromNowOrNow = function(a) {
  let now = moment()
  if (now.diff(this) < 2000) {
    return 'just now';
  }
  else {
    return this.fromNow(a);
  }
}

let labelApp = new Vue({
  el: '#label-app',
  created: function() {
    this.fetchState()
    this.setupKeybindings()
    let _this = this
    setInterval(function() { _this.prettifyLastSave() },
                1000)
  },
  mounted: function() {
    $('#instructions').modal('show')
  },
  data: { 
    'events': {
      'unlabelled': [],
      'not_SWR': [],
      'SWR': [],
      'activeEvent': null,
    },
    'last_save': null,
    'last_save_pretty': null,
  },
  watch: {
    events: {
      deep: true,
      handler: function() {
        this.saveState()
      },
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
    saveState: _.debounce(function() {
        let _this = this
        $.ajax(`${backend}/save`, {
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({events: _this.events}),
        })
        .done(function() {
          _this.last_save = moment()
          _this.prettifyLastSave()
        })
      },
      500,
      {
        leading: true,
        trailing: true,
      }),
    loadUnlabelledEvent: function() {
      if (this.events.activeEvent == null) {
        let e = this.events.unlabelled.shift()
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
    prettifyLastSave: function() {
      if (this.last_save != null) {
        let absolute = this.last_save.format('HH:mm:ss')
        let relative = this.last_save.fromNowOrNow()
        this.last_save_pretty = `${absolute} (${relative})`
      }
    },
    labelActiveEvent: function(label) {
      /**
       * Move the currently active event to the list specified by 'label'.
       */
      let e = this.events.activeEvent
      if (e != null) {
        this.events[label].unshift(e)
      }
      this.events.activeEvent = null
      this.loadUnlabelledEvent()
    },
    unlabel: function(event, label) {
      _.pull(this.events[label], event)
      this.events.unlabelled.unshift(event)
      this.loadUnlabelledEvent()
    },
    imageSrc: (event) => {
      return `img/vignettes/${event.id}.png`
    },
    imageSrcContext: (event) => {
      return `img/context/${event.id}.png`
    },
  },
});
