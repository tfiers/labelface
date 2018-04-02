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
    this.fetchSubsets()
    this.setupKeybindings()
    let _this = this
    setInterval(function() { _this.prettifyLastSave() },
                1000)
  },
  mounted: function() {
    $('#instructions').modal('show')
  },
  data: {
    'subsets': [],
    'selected_subset': '',
    'events': {
      'unlabelled': [],
      'not_SWR': [],
      'SWR': [],
      'activeEvent': null,
    },
    'last_save': null,
    'last_save_pretty': null,
    'hovered': null,
  },
  watch: {
    selected_subset: {
      handler: function() {
        this.fetchState()
      },
    },
    events: {
      deep: true,
      handler: function() {
        this.saveState()
      },
    },
  },
  computed: {
    contextEvent: function() {
      if (this.hovered != null) {
        return this.imageSrcContext(this.hovered)
      }
      else if (this.events.activeEvent != null) {
        return this.imageSrcContext(this.events.activeEvent)
      }
      else {
        return ''
      }
    },
  },
  methods: {
    fetchSubsets: function() {
      let _this = this
      $.getJSON(`${backend}/subsets`, function(data) {
        _this.subsets = data
        _this.selected_subset = _this.subsets[0]
      })
    },
    fetchState: function() {
      const url = `${backend}/state`
      const params = {
        'author': 'ik',
        'subset': this.selected_subset,
      }
      const _this = this
      $.getJSON(url, params, function(data) {
        _this.events = data.events
        _this.loadUnlabelledEvent()
      })
    },
    saveState: _.debounce(function() {
        const data = {
          'author': 'ik',
          'subset': this.selected_subset,
          'events': this.events,
        }
        const _this = this
        $.ajax(`${backend}/state`, {
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
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
      // Move the currently active event back to the 'Unlabelled' queue.
      let prevActive = this.events.activeEvent
      if (prevActive != null) {
        this.events.unlabelled.unshift(prevActive)
      }
      // Remove the selected labelled event from its queue
      _.pull(this.events[label], event)
      // Make the selected event the active event.
      this.events.activeEvent = event
      this.loadUnlabelledEvent()
    },
    imageSrc: (event) => {
      return `img/vignettes/${event.id}.png`
    },
    imageSrcContext: (event) => {
      return `img/context/${event.id}.png`
    },
    vignetteTitle: (event) => {
      let s = 'Click to unlabel'
      if (event.comment) {
        s += `\nComment: "${event.comment}"`
      }
      return s
    },
  },
});
