(function() {
  var CompositeDisposable, LTConsole, LTConsoleView;

  LTConsoleView = require('./ltconsole-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = LTConsole = (function() {
    LTConsole.prototype.ltConsoleView = null;

    LTConsole.prototype.bottomPanel = null;

    LTConsole.prototype.subscriptions = null;

    function LTConsole(state) {
      console.log("constructing LTConsole");
      if (state === void 0) {
        state = {};
      }
      this.ltConsoleView = new LTConsoleView(state.ltConsoleViewState);
      this.bottomPanel = atom.workspace.addBottomPanel({
        item: this.ltConsoleView.getPanel(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
    }

    LTConsole.prototype.destroy = function() {
      this.bottomPanel.destroy();
      this.subscriptions.dispose();
      return this.ltConsoleView.destroy();
    };

    LTConsole.prototype.serialize = function() {
      return {
        ltConsoleViewState: this.ltConsoleView.serialize()
      };
    };

    LTConsole.prototype.show = function() {
      console.log("ltconsole.show()");
      return this.bottomPanel.show();
    };

    LTConsole.prototype.hide = function() {
      console.log("ltconsole.hide()");
      return this.bottomPanel.hide();
    };

    LTConsole.prototype.isVisible = function() {
      return this.bottomPanel.isVisible();
    };

    LTConsole.prototype.toggle_log = function() {
      if (this.isVisible()) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    LTConsole.prototype.addContent = function(t, br, is_html, cb) {
      var el_br, el_span, el_text;
      if (br == null) {
        br = true;
      }
      if (is_html == null) {
        is_html = false;
      }
      if (cb == null) {
        cb = void 0;
      }
      el_span = document.createElement('span');
      el_br = document.createElement('br');
      if (cb) {
        el_span.onclick = cb;
      }
      if (is_html) {
        el_span.innerHTML = t;
      } else {
        el_text = document.createTextNode(t);
        el_span.appendChild(el_text);
        el_text = null;
      }
      if (br) {
        el_span.appendChild(el_br);
      }
      this.ltConsoleView.getElement().appendChild(el_span);
      return this.ltConsoleView.getElement().scrollTop = this.ltConsoleView.getElement().scrollHeight;
    };

    LTConsole.prototype.clear = function() {
      return this.ltConsoleView.getElement().innerHTML = "";
    };

    LTConsole.prototype.add_log = function() {
      var i, _i, _results;
      if (this.bottomPanel.isVisible()) {
        _results = [];
        for (i = _i = 1; _i <= 10; i = ++_i) {
          _results.push((function(_this) {
            return function(i) {
              var br, cb, is_html;
              return _this.addContent("Line " + i, br = true, is_html = false, cb = function() {
                return console.log("Line " + i + " clicked");
              });
            };
          })(this)(i));
        }
        return _results;
      }
    };

    return LTConsole;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2x0Y29uc29sZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0JBQUEsYUFBQSxHQUFlLElBQWYsQ0FBQTs7QUFBQSx3QkFDQSxXQUFBLEdBQWEsSUFEYixDQUFBOztBQUFBLHdCQUVBLGFBQUEsR0FBZSxJQUZmLENBQUE7O0FBSWEsSUFBQSxtQkFBQyxLQUFELEdBQUE7QUFDWCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVosQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLEtBQUEsS0FBUyxNQUFaO0FBQ0UsUUFBQSxLQUFBLEdBQVEsRUFBUixDQURGO09BREE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQUssQ0FBQyxrQkFBcEIsQ0FIckIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQSxDQUFOO0FBQUEsUUFBaUMsT0FBQSxFQUFTLEtBQTFDO09BQTlCLENBSmYsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQVJqQixDQURXO0lBQUEsQ0FKYjs7QUFBQSx3QkFlQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENB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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/ltconsole.coffee
