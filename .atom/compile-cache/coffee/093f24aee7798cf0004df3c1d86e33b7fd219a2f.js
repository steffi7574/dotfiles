(function() {
  var CompositeDisposable, HoverContainer, Match, MatchList, Range, getView, saveEditorState, settings, _, _ref, _ref1;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  _ = require('underscore-plus');

  settings = require('./settings');

  _ref1 = require('./utils'), getView = _ref1.getView, saveEditorState = _ref1.saveEditorState;

  Match = null;

  MatchList = null;

  HoverContainer = null;

  module.exports = {
    subscriptions: null,
    config: settings.config,
    searchHistory: null,
    container: null,
    activate: function() {
      var _ref2;
      _ref2 = require('./match'), Match = _ref2.Match, MatchList = _ref2.MatchList;
      HoverContainer = require('./hover-indicator').HoverContainer;
      this.searchHistory = [];
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'isearch:search-forward': (function(_this) {
          return function() {
            return _this.start('forward');
          };
        })(this),
        'isearch:search-backward': (function(_this) {
          return function() {
            return _this.start('backward');
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.cancel();
    },
    start: function(direction) {
      var ui, _ref2;
      this.direction = direction;
      ui = this.getUI();
      if (!ui.isVisible()) {
        this.searchHistoryIndex = -1;
        this.editor = this.getEditor();
        this.restoreEditorState = saveEditorState(this.editor);
        this.matches = new MatchList();
        this.vimState = (_ref2 = this.vimModeService) != null ? _ref2.getEditorState(this.editor) : void 0;
        return ui.focus();
      } else {
        if (this.matches.isEmpty()) {
          return;
        }
        this.matches.visit(this.direction);
        if (atom.config.get('isearch.showHoverIndicator')) {
          this.showHover(this.matches.getCurrent());
        }
        return ui.showCounter();
      }
    },
    getUI: function() {
      var ui;
      return this.ui != null ? this.ui : this.ui = (ui = new (require('./ui')), ui.initialize(this), ui);
    },
    getCandidates: function(text) {
      var matches;
      matches = [];
      this.editor.scan(this.getRegExp(text), (function(_this) {
        return function(_arg) {
          var matchText, range;
          range = _arg.range, matchText = _arg.matchText;
          return matches.push(new Match(_this.editor, {
            range: range,
            matchText: matchText
          }));
        };
      })(this));
      return matches;
    },
    search: function(text) {
      var _ref2, _ref3;
      this.matches.reset();
      if (!text) {
        if ((_ref2 = this.container) != null) {
          _ref2.hide();
        }
        return;
      }
      this.matches.replace(this.getCandidates(text));
      if (this.matches.isEmpty()) {
        this.debouncedFlashScreen();
        if ((_ref3 = this.container) != null) {
          _ref3.hide();
        }
        return;
      }
      if (this.matchCursor == null) {
        this.matchCursor = this.getMatchForCursor();
      }
      this.matches.visit(this.direction, {
        from: this.matchCursor,
        redrawAll: true
      });
      if (atom.config.get('isearch.showHoverIndicator')) {
        return this.showHover(this.matches.getCurrent());
      }
    },
    showHover: function(match) {
      if (this.container == null) {
        this.container = new HoverContainer().initialize(this.editor);
      }
      return this.container.show(match, this.getCount());
    },
    getMatchForCursor: function() {
      var end, match, start;
      start = this.editor.getCursorBufferPosition();
      end = start.translate([0, 1]);
      match = new Match(this.editor, {
        range: new Range(start, end)
      });
      match.decorate('isearch-cursor');
      return match;
    },
    cancel: function() {
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.restoreEditorState = null;
      return this.reset();
    },
    land: function() {
      var point;
      point = this.matches.getCurrent().start;
      if (this.editor.getLastSelection().isEmpty()) {
        this.editor.setCursorBufferPosition(point);
      } else {
        this.editor.selectToBufferPosition(point);
      }
      return this.reset();
    },
    reset: function() {
      var _ref2, _ref3, _ref4, _ref5;
      if ((_ref2 = this.matchCursor) != null) {
        _ref2.destroy();
      }
      if ((_ref3 = this.container) != null) {
        _ref3.destroy();
      }
      if ((_ref4 = this.matches) != null) {
        _ref4.destroy();
      }
      return _ref5 = {}, this.flashingTimeout = _ref5.flashingTimeout, this.restoreEditorState = _ref5.restoreEditorState, this.matchCursor = _ref5.matchCursor, this.container = _ref5.container, this.matches = _ref5.matches, _ref5;
    },
    getCount: function() {
      return this.matches.getInfo();
    },
    getHistory: function(direction) {
      var vimSearchItem;
      if (settings.get('vimModeSyncSearchHistoy')) {
        if (vimSearchItem = this.getVimSearchHistoryItem()) {
          this.saveHistory(vimSearchItem);
        }
      }
      if (direction === 'prev') {
        if (this.searchHistoryIndex !== (this.searchHistory.length - 1)) {
          this.searchHistoryIndex += 1;
        }
      } else if (direction === 'next') {
        if (!(this.searchHistoryIndex <= 0)) {
          this.searchHistoryIndex -= 1;
        }
      }
      return this.searchHistory[this.searchHistoryIndex];
    },
    saveHistory: function(text) {
      this.searchHistory.unshift(text);
      this.searchHistory = _.uniq(this.searchHistory);
      if (this.searchHistory.length > settings.get('historySize')) {
        this.searchHistory.pop();
      }
      if (settings.get('vimModeSyncSearchHistoy')) {
        return this.saveVimSearchHistory(text);
      }
    },
    getRegExp: function(text) {
      var flags, pattern, wildChar;
      if (settings.get('useSmartCase') && text.match('[A-Z]')) {
        flags = 'g';
      } else {
        flags = 'gi';
      }
      if (settings.get('useWildChar') && (wildChar = settings.get('wildChar'))) {
        pattern = text.split(wildChar).map(function(pattern) {
          return _.escapeRegExp(pattern);
        }).join('.*?');
      } else {
        pattern = _.escapeRegExp(text);
      }
      return new RegExp(pattern, flags);
    },
    getEditorState: function(editor) {
      return {
        scrollTop: getView(editor).getScrollTop()
      };
    },
    setEditorState: function(editor, _arg) {
      var scrollTop;
      scrollTop = _arg.scrollTop;
      return getView(editor).setScrollTop(scrollTop);
    },
    getEditor: function() {
      return atom.workspace.getActiveTextEditor();
    },
    debouncedFlashScreen: function() {
      if (this._debouncedFlashScreen == null) {
        this._debouncedFlashScreen = _.debounce(this.flashScreen.bind(this), 150, true);
      }
      return this._debouncedFlashScreen();
    },
    flashScreen: function() {
      var endRow, marker, range, startRow, _ref2, _ref3;
      _ref2 = this.editor.getVisibleRowRange().map((function(_this) {
        return function(row) {
          return _this.editor.bufferRowForScreenRow(row);
        };
      })(this)), startRow = _ref2[0], endRow = _ref2[1];
      range = new Range([startRow, 0], [endRow, Infinity]);
      marker = this.editor.markBufferRange(range, {
        invalidate: 'never',
        persistent: false
      });
      if ((_ref3 = this.flashingDecoration) != null) {
        _ref3.getMarker().destroy();
      }
      clearTimeout(this.flashingTimeout);
      this.flashingDecoration = this.editor.decorateMarker(marker, {
        type: 'highlight',
        "class": 'isearch-flash'
      });
      return this.flashingTimeout = setTimeout((function(_this) {
        return function() {
          _this.flashingDecoration.getMarker().destroy();
          return _this.flashingDecoration = null;
        };
      })(this), 150);
    },
    consumeVimMode: function(vimModeService) {
      this.vimModeService = vimModeService;
    },
    getVimSearchHistoryItem: function() {
      var _ref2, _ref3, _ref4;
      return (_ref2 = this.vimModeService) != null ? (_ref3 = _ref2.getEditorState(this.editor)) != null ? (_ref4 = _ref3.getSearchHistoryItem()) != null ? _ref4.replace(/\\b/g, '') : void 0 : void 0 : void 0;
    },
    saveVimSearchHistory: function(text) {
      var vimState, _ref2;
      if (!(vimState = (_ref2 = this.vimModeService) != null ? _ref2.getEditorState(this.editor) : void 0)) {
        return;
      }
      if (text !== this.getVimSearchHistoryItem()) {
        return vimState.pushSearchHistory(text);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdIQUFBOztBQUFBLEVBQUEsT0FBK0IsT0FBQSxDQUFRLE1BQVIsQ0FBL0IsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixhQUFBLEtBQXRCLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxRQUE2QixPQUFBLENBQVEsU0FBUixDQUE3QixFQUFDLGdCQUFBLE9BQUQsRUFBVSx3QkFBQSxlQUhWLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsSUFMUixDQUFBOztBQUFBLEVBTUEsU0FBQSxHQUFZLElBTlosQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsSUFQakIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFDQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BRGpCO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLEtBQUE7QUFBQSxNQUFBLFFBQXFCLE9BQUEsQ0FBUSxTQUFSLENBQXJCLEVBQUMsY0FBQSxLQUFELEVBQVEsa0JBQUEsU0FBUixDQUFBO0FBQUEsTUFDQyxpQkFBb0IsT0FBQSxDQUFRLG1CQUFSLEVBQXBCLGNBREQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFGakIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQUQs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

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/main.coffee
