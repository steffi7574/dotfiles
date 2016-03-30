(function() {
  var Container, Hover, HoverElemnt, getView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  getView = require('./utils').getView;

  Hover = (function(_super) {
    __extends(Hover, _super);

    function Hover() {
      return Hover.__super__.constructor.apply(this, arguments);
    }

    Hover.prototype.createdCallback = function() {
      this.classList.add('isearch-hover');
      this.style.marginLeft = '5px';
      this.style.marginTop = '-20px';
      this.style.paddingLeft = '0.2em';
      this.style.paddingRight = '0.2em';
      return this;
    };

    Hover.prototype.show = function(_arg) {
      var counter, current, editor, editorView, left, match, px, top, total;
      editor = _arg.editor, match = _arg.match, counter = _arg.counter;
      this.classList.remove('top');
      this.classList.remove('bottom');
      if (match.isTop()) {
        this.classList.add('top');
      }
      if (match.isBottom()) {
        this.classList.add('bottom');
      }
      editorView = getView(editor);
      px = editorView.pixelPositionForBufferPosition(match.end);
      top = px.top - editorView.getScrollTop();
      left = px.left - editorView.getScrollLeft();
      this.style.top = top + 'px';
      this.style.left = left + 'px';
      if (top <= 0) {
        this.style.marginTop = '0px';
      }
      current = counter.current, total = counter.total;
      return this.textContent = "" + current + "/" + total;
    };

    Hover.prototype.destroy = function() {
      return this.remove();
    };

    return Hover;

  })(HTMLElement);

  Container = (function(_super) {
    __extends(Container, _super);

    function Container() {
      return Container.__super__.constructor.apply(this, arguments);
    }

    Container.prototype.initialize = function(editor) {
      var editorView;
      this.editor = editor;
      this.classList.add('isearch', 'hover-container');
      editorView = atom.views.getView(this.editor);
      this.overlayer = editorView.shadowRoot.querySelector('content[select=".overlayer"]');
      this.overlayer.appendChild(this);
      return this;
    };

    Container.prototype.show = function(match, counter) {
      var _ref;
      if ((_ref = this.hover) != null) {
        _ref.destroy();
      }
      this.hover = new HoverElemnt();
      this.appendChild(this.hover);
      return this.hover.show({
        editor: this.editor,
        match: match,
        counter: counter
      });
    };

    Container.prototype.hide = function() {
      var _ref;
      return (_ref = this.hover) != null ? _ref.destroy() : void 0;
    };

    Container.prototype.destroy = function() {
      var _ref;
      if ((_ref = this.hover) != null) {
        _ref.destroy();
      }
      this.overlayer = null;
      return this.remove();
    };

    return Container;

  })(HTMLElement);

  HoverElemnt = document.registerElement('isearch-hover', {
    prototype: Hover.prototype,
    "extends": 'div'
  });

  module.exports = {
    HoverContainer: document.registerElement('isearch-hover-container', {
      prototype: Container.prototype,
      "extends": 'div'
    })
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL2hvdmVyLWluZGljYXRvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLFNBQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFFTTtBQUNKLDRCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxvQkFBQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsZUFBZixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxHQUFzQixLQUR0QixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsR0FBc0IsT0FGdEIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFQLEdBQXNCLE9BSHRCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBUCxHQUFzQixPQUp0QixDQUFBO2FBS0EsS0FOZTtJQUFBLENBQWpCLENBQUE7O0FBQUEsb0JBUUEsSUFBQSxHQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osVUFBQSxpRUFBQTtBQUFBLE1BRE0sY0FBQSxRQUFRLGFBQUEsT0FBTyxlQUFBLE9BQ3JCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixLQUFsQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixRQUFsQixDQURBLENBQUE7QUFFQSxNQUFBLElBQTJCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBM0I7QUFBQSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxD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

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/hover-indicator.coffee
