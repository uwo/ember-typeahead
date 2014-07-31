Portal.AutoCompleteSuggestionView = Ember.View.extend({
  tagName:'li',
  classNameBindings: ['isActive:active'],
  isActive: function () {
    return this.get('contentIndex') === this.get('controller.suggestionIndex');
  }.property('controller.suggestionIndex')
});
(function () {

  function selectHint(e) {
    var hint = this.get('hint');
    if (hint) {
      var sel = this.get('selection');
      var re = new RegExp(sel, 'i');
      if (re.test(hint) && hint !== sel) {
        e.preventDefault();
        this.set('selection', hint);
      }
    }
  }

  function pickSuggestion(step) {
    var suggestions = this.get('suggestions');
    var length = suggestions.length;

    var suggestionIndex = this.get('suggestionIndex');
    var index = cycle(length, suggestionIndex, step);
    this.set('suggestionIndex', index);

    this.set('settingSelection', true);
    if (index === -1) {
      this.set('selection', this.get('userQuery'));
    } else {
      this.set('selection', suggestions.objectAt(index));
    }
    this.set('settingSelection', false);
  }

  function nextSuggestion(e) {
    pickSuggestion.call(this, 1);
  }

  function previousSuggestion(e) {
    e.preventDefault(); // we want the cursor to stay at the end of the word!
    pickSuggestion.call(this, -1);
  }

  function cycle(upperbound, index, step) {
    var next = index + step;
    if (next < -1) return upperbound + step;
    else if (next >= upperbound) return -2 + step;
    else return next;
  }

Portal.AutoCompleteComponent = Ember.Component.extend({
  //style
  tagName: 'span',
  classNames: ['my-typeahead'],
  displaySuggestions:function () {
    if (_.isEmpty(this.get('suggestions'))) 
      return "display:none;";
    else 
      return "display:block;z-index:9999;";
  }.property('suggestions'),

  //events
  KEYS: {
     13:'enter',
     27:'esc',
     9:'tab',
     39:'right',
     38: 'up',
     40:'down'
  },
  enter: selectHint,
  tab: selectHint,
  down: nextSuggestion,
  up: previousSuggestion,
  right: selectHint,
  esc: function () {
    this.set('suggestionIndex', -1);
  },
  keyDown: function (e) {
    var key = this.get('KEYS')[e.keyCode];
    if (key) {
      var keyHandler = this.get(key);
      keyHandler.call(this, e);
    }
  },
  actions: {
    setSuggestionIndex: function (index) {
      this.set('suggestionIndex', index);
    }
  },

  //state
  displayKey: null,
  suggestionIndex: -1,
  browsingSuggestions: function () {
    return this.get('suggestionIndex') !== -1;
  }.property('suggestionIndex'),

  selection: '',
  userQuery: '',
  settingSelection: false,
  selectionDidChange: function () {
    if (!this.get('browsingSuggestions')) {
      this.set('userQuery', this.get('selection'));
    }
  }.observes('selection'),


  suggestions: function () {
    if (this.get('browsingSuggestions')) return this.cacheFor('suggestions');
    var userQuery = this.get('userQuery');
    if (userQuery !== "") {
      var displayKey = this.get('displayKey');
      var re = new RegExp(userQuery, 'i');
      var test = _.bind(re.test, re);

      return this.get('data').mapBy(displayKey).filter(test);
    } else {
      return [];
    }
  }.property('userQuery', 'data'),

  hint: function () {
    var suggestions = this.get('suggestions');
    var selection = this.get('selection');
    var re = new RegExp('^' + selection, 'i');
    var test = _.bind(re.test, re);
    var suggestion = _.find(suggestions, test);
    if (suggestion) {
      // return the matching head of the suggestion so that the type aligns :)
      return selection + suggestion.slice(selection.length);
    } else {
      return null;
    }
  }.property('suggestions', 'selection')
});
})();
