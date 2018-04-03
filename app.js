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

Vue.use(VueLoading)
Vue.use(VueScrollTo)

let labelApp = new Vue({
  el: '#label-app',
  components: {
    loading: VueLoading,
  },
  created: function() {
    this.fetchSubsets()
    this.setupKeybindings()
    let _this = this
    setInterval(() => _this.prettifyLastSave(), 1000)
  },
  mounted: function() {
    // $('#instructions').modal('show')
  },
  data: {
    'loading': true,
    'username': 'tomasf',
    'subsets': [],
    'selected_subset': '',
    'events': [],
    'activeEvent': null,
    'last_save': null,
    'last_save_pretty': null,
    'hovered': null,
    'cancel_scroll': null,
  },
  watch: {
    selected_subset: {
      handler: function() {
        this.loading = true
        this.fetchState()
      },
    },
    events: {
      deep: true,
      handler: function() {
        this.saveState()
      },
    },
    activeEvent: {
      handler: function() {
        this.scrollToActiveEvent()
      },
    },
  },
  computed: {
    activeEventIndex: function() {
      return this.events.indexOf(this.activeEvent)
    },
    contextSrc: function() {
      if (this.hovered != null) {
        return this.imageSrcContext(this.hovered)
      }
      else if (this.activeEvent != null) {
        return this.imageSrcContext(this.activeEvent)
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
        _this.activateFirstUnlabelled()
        _this.loading = false
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
    activateFirstUnlabelled: function() {
      let event = this.events.find(this.unlabelled)
      this.activeEvent = event
      setTimeout(this.scrollToActiveEvent, 1000)
      this.scrollToActiveEvent()
    },
    activate: function(event) {
      this.activeEvent = event
    },
    labelActiveEvent: function(label) {
      this.activeEvent.label = label
      // this.activateFirstUnlabelled()
    },
    moveLeft: function() {
      let ix = this.activeEventIndex
      if (ix > 0) {
        this.activeEvent = this.events[ix - 1]
      }
    },
    moveRight: function() {
      let ix = this.activeEventIndex
      if (ix < this.events.length - 1) {
        this.activeEvent = this.events[ix + 1]
      }
    },
    scrollToActiveEvent: _.debounce(function() {
      if (this.cancel_scroll != null) {
        this.cancel_scroll()
      }
      const el = `#vignette-${this.activeEvent.id}`
      const listWidth = $('#vignette-container').width()
      const imgWidth = $(el).width()
      this.cancel_scroll = VueScrollTo.scrollTo(el, 200, {
        container: '#vignette-container',
        x: true,
        y: false,
        offset: - (listWidth / 2 - imgWidth / 2),
      })
    }, 300),
    setupKeybindings: function() {
      let _this = this
      window.addEventListener('keyup', function(e) {
        switch (e.which) {
          case 37:
            _this.moveLeft()
            break
          case 39:
            _this.moveRight()
            break
          case 38:
            _this.labelActiveEvent('SWR')
            break
          case 40:
            _this.labelActiveEvent('not_SWR')
            break
        }
      })
      $('#vignette-container').on('keydown', function(e) {
        e.stopPropagation()
        e.preventDefault()
      })
    },
    prettifyLastSave: function() {
      if (this.last_save != null) {
        let absolute = this.last_save.format('HH:mm:ss')
        let relative = this.last_save.fromNowOrNow()
        this.last_save_pretty = `${absolute} (${relative})`
      }
    },
    imageSrc: (event) => {
      return `img/vignettes/${event.id}.png`
    },
    imageSrcContext: (event) => {
      return `img/context/${event.id}.png`
    },
    unlabelled: (event) => (event.label == null),
    vignetteTitle: (event) => {
      let s = ''
      if (event.label == 'null') {
        s += 'Unlabelled'
      }
      else {
        s += `Label: ${event.label}`
      }
      if (event.comment) {
        s += `\nComment: "${event.comment}"`
      }
      s += '\nClick to activate'
      return s
    },
    vignetteClass: function(event) {
      return {
        'has-comment': event.comment != null,
        'active': event == this.activeEvent,
        'unlabelled': event.label == null,
        'SWR': event.label == 'SWR',
        'not-SWR': event.label == 'not_SWR',
      }
    },
  },
});
