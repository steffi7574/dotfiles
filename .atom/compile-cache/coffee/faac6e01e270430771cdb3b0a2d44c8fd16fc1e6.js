(function() {
  var Match, MatchList, flashRanges, getIndex, selectVisibleBy, settings, sortRanges, _, _ref,
    __slice = [].slice;

  _ = require('underscore-plus');

  _ref = require('./utils'), selectVisibleBy = _ref.selectVisibleBy, sortRanges = _ref.sortRanges, getIndex = _ref.getIndex, flashRanges = _ref.flashRanges;

  settings = require('./settings');

  MatchList = (function() {
    MatchList.prototype.index = null;

    MatchList.prototype.entries = null;

    function MatchList(vimState, ranges, index) {
      var current, first, last, others, range, _i, _j, _len, _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      this.entries = [];
      if (!ranges.length) {
        return;
      }
      current = ranges[getIndex(index, ranges)];
      ranges = sortRanges(ranges);
      this.index = ranges.indexOf(current);
      first = ranges[0], others = 3 <= ranges.length ? __slice.call(ranges, 1, _i = ranges.length - 1) : (_i = 1, []), last = ranges[_i++];
      for (_j = 0, _len = ranges.length; _j < _len; _j++) {
        range = ranges[_j];
        this.entries.push(new Match(this.vimState, range, {
          first: range === first,
          last: range === last,
          current: range === current
        }));
      }
    }

    MatchList.prototype.isEmpty = function() {
      return this.entries.length === 0;
    };

    MatchList.prototype.setIndex = function(index) {
      return this.index = getIndex(index, this.entries);
    };

    MatchList.prototype.get = function(direction) {
      var match;
      if (direction == null) {
        direction = null;
      }
      this.entries[this.index].current = false;
      switch (direction) {
        case 'next':
          this.setIndex(this.index + 1);
          break;
        case 'prev':
          this.setIndex(this.index - 1);
      }
      match = this.entries[this.index];
      match.current = true;
      return match;
    };

    MatchList.prototype.getVisible = function() {
      return selectVisibleBy(this.editor, this.entries, function(m) {
        return m.range;
      });
    };

    MatchList.prototype.getOffSetPixelHeight = function(lineDelta) {
      var scrolloff;
      if (lineDelta == null) {
        lineDelta = 0;
      }
      scrolloff = 2;
      return this.editor.getLineHeightInPixels() * (2 + lineDelta);
    };

    MatchList.prototype.scroll = function(direction) {
      var match, offsetPixel, point, scrollTop, step;
      switch (direction) {
        case 'next':
          if ((match = _.last(this.getVisible())).isLast()) {
            return;
          }
          step = +1;
          offsetPixel = this.getOffSetPixelHeight();
          break;
        case 'prev':
          if ((match = _.first(this.getVisible())).isFirst()) {
            return;
          }
          step = -1;
          offsetPixel = this.editorElement.getHeight() - this.getOffSetPixelHeight(1);
      }
      this.setIndex(this.entries.indexOf(match) + step);
      point = this.editor.screenPositionForBufferPosition(match.getStartPoint());
      scrollTop = this.editorElement.pixelPositionForScreenPosition(point).top;
      return this.editor.setScrollTop((scrollTop -= offsetPixel));
    };

    MatchList.prototype.show = function() {
      var m, _i, _len, _ref1, _results;
      this.reset();
      _ref1 = this.getVisible();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        m = _ref1[_i];
        _results.push(m.show());
      }
      return _results;
    };

    MatchList.prototype.reset = function() {
      var m, _i, _len, _ref1, _results;
      _ref1 = this.entries;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        m = _ref1[_i];
        _results.push(m.reset());
      }
      return _results;
    };

    MatchList.prototype.destroy = function() {
      var m, _i, _len, _ref1, _ref2;
      _ref1 = this.entries;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        m = _ref1[_i];
        m.destroy();
      }
      return _ref2 = {}, this.entries = _ref2.entries, this.index = _ref2.index, this.editor = _ref2.editor, _ref2;
    };

    MatchList.prototype.showHover = function(_arg) {
      var current, timeout;
      timeout = _arg.timeout;
      current = this.get();
      if (settings.get('showHoverSearchCounter')) {
        return this.vimState.hoverSearchCounter.withTimeout(current.range.start, {
          text: "" + (this.index + 1) + "/" + this.entries.length,
          classList: current.getClassList(),
          timeout: timeout
        });
      }
    };

    return MatchList;

  })();

  Match = (function() {
    Match.prototype.first = false;

    Match.prototype.last = false;

    Match.prototype.current = false;

    function Match(vimState, range, _arg) {
      this.vimState = vimState;
      this.range = range;
      this.first = _arg.first, this.last = _arg.last, this.current = _arg.current;
      this.editor = this.vimState.editor;
    }

    Match.prototype.getClassList = function() {
      var last;
      last = (!this.first) && this.last;
      return [this.first && 'first', last && 'last', this.current && 'current'].filter(function(e) {
        return e;
      });
    };

    Match.prototype.isFirst = function() {
      return this.first;
    };

    Match.prototype.isLast = function() {
      return this.last;
    };

    Match.prototype.isCurrent = function() {
      return this.current;
    };

    Match.prototype.compare = function(other) {
      return this.range.compare(other.range);
    };

    Match.prototype.isEqual = function(other) {
      return this.range.isEqual(other.range);
    };

    Match.prototype.getStartPoint = function() {
      return this.range.start;
    };

    Match.prototype.visit = function() {
      var point;
      point = this.getStartPoint();
      this.editor.scrollToBufferPosition(point, {
        center: true
      });
      if (this.editor.isFoldedAtBufferRow(point.row)) {
        return this.editor.unfoldBufferRow(point.row);
      }
    };

    Match.prototype.flash = function(_arg) {
      var timeout;
      timeout = (_arg != null ? _arg : {}).timeout;
      return flashRanges(this.range, {
        editor: this.editor,
        "class": 'vim-mode-plus-flash',
        timeout: timeout != null ? timeout : settings.get('flashOnSearchDuration')
      });
    };

    Match.prototype.show = function() {
      var klass, s;
      klass = 'vim-mode-plus-search-match';
      if (s = this.getClassList().join(' ')) {
        klass += " " + s;
      }
      this.marker = this.editor.markBufferRange(this.range, {
        invalidate: 'never',
        persistent: false
      });
      return this.editor.decorateMarker(this.marker, {
        type: 'highlight',
        "class": klass
      });
    };

    Match.prototype.reset = function() {
      var _ref1;
      if ((_ref1 = this.marker) != null) {
        _ref1.destroy();
      }
      return this.marker = null;
    };

    Match.prototype.destroy = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.marker) != null) {
        _ref1.destroy();
      }
      return _ref2 = {}, this.marker = _ref2.marker, this.vimState = _ref2.vimState, this.range = _ref2.range, this.editor = _ref2.editor, this.first = _ref2.first, this.last = _ref2.last, this.current = _ref2.current, _ref2;
    };

    return Match;

  })();

  module.exports = {
    MatchList: MatchList
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hdGNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1RkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUF1RCxPQUFBLENBQVEsU0FBUixDQUF2RCxFQUFDLHVCQUFBLGVBQUQsRUFBa0Isa0JBQUEsVUFBbEIsRUFBOEIsZ0JBQUEsUUFBOUIsRUFBd0MsbUJBQUEsV0FEeEMsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFJTTtBQUNKLHdCQUFBLEtBQUEsR0FBTyxJQUFQLENBQUE7O0FBQUEsd0JBQ0EsT0FBQSxHQUFTLElBRFQsQ0FBQTs7QUFHYSxJQUFBLG1CQUFFLFFBQUYsRUFBWSxNQUFaLEVBQW9CLEtBQXBCLEdBQUE7QUFDWCxVQUFBLHdEQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLFFBQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsc0JBQUEsYUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBRFgsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FGQTtBQUFBLE1BS0EsT0FBQSxHQUFVLE1BQU8sQ0FBQSxRQUFBLENBQVMsS0FBVCxFQUFnQixNQUFoQixDQUFBLENBTGpCLENBQUE7QUFBQSxNQU1BLE1BQUEsR0FBUyxVQUFBLENBQVcsTUFBWCxDQU5ULENBQUE7QUFBQSxNQU9BLElBQUMs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/match.coffee
