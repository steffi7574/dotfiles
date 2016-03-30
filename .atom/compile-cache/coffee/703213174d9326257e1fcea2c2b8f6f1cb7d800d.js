(function() {
  var Hover, HoverElement, emoji, emojiFolder, settings,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  emoji = require('emoji-images');

  emojiFolder = 'atom://vim-mode-plus/node_modules/emoji-images/pngs';

  settings = require('./settings');

  Hover = (function() {
    var iconRegexp;

    Hover.prototype.lineHeight = null;

    Hover.prototype.point = null;

    function Hover(vimState, param) {
      this.vimState = vimState;
      this.param = param;
      this.text = [];
      this.view = atom.views.getView(this);
    }

    Hover.prototype.setPoint = function(point) {
      if (point == null) {
        point = null;
      }
      return this.point = point != null ? point : this.vimState.editor.getCursorBufferPosition();
    };

    Hover.prototype.add = function(text, point) {
      this.text.push(text);
      if (point) {
        this.setPoint(point);
      }
      return this.view.show(this.point);
    };

    Hover.prototype.replaceLastSection = function(text, point) {
      this.text.pop();
      return this.add(text, point);
    };

    Hover.prototype.withTimeout = function(point, options) {
      var text, timeout, _ref;
      this.reset();
      text = options.text, timeout = options.timeout;
      if (options.classList.length) {
        (_ref = this.view.classList).add.apply(_ref, options.classList);
      }
      this.add(text, point);
      if (timeout != null) {
        return this.timeoutID = setTimeout((function(_this) {
          return function() {
            return _this.reset();
          };
        })(this), timeout);
      }
    };

    iconRegexp = /^:.*:$/;

    Hover.prototype.getText = function(lineHeight) {
      if (!this.text.length) {
        return null;
      }
      return this.text.map(function(text) {
        text = String(text);
        if (settings.get('showHoverOnOperateIcon') === 'emoji') {
          return emoji(String(text), emojiFolder, lineHeight);
        } else {
          return text.replace(/:(.*?):/g, function(s, m) {
            return "<span class='icon icon-" + m + "'></span>";
          });
        }
      }).join('');
    };

    Hover.prototype.reset = function() {
      var _ref;
      this.text = [];
      clearTimeout(this.timeoutID);
      this.view.reset();
      return _ref = {}, this.timeoutID = _ref.timeoutID, this.point = _ref.point, _ref;
    };

    Hover.prototype.destroy = function() {
      var _ref;
      _ref = {}, this.param = _ref.param, this.vimState = _ref.vimState;
      return this.view.destroy();
    };

    return Hover;

  })();

  HoverElement = (function(_super) {
    __extends(HoverElement, _super);

    function HoverElement() {
      return HoverElement.__super__.constructor.apply(this, arguments);
    }

    HoverElement.prototype.createdCallback = function() {
      this.className = 'vim-mode-plus-hover';
      return this;
    };

    HoverElement.prototype.initialize = function(model) {
      this.model = model;
      return this;
    };

    HoverElement.prototype.show = function(point) {
      var editor, text;
      editor = this.model.vimState.editor;
      if (!this.marker) {
        this.createOverlay(point);
        this.lineHeight = editor.getLineHeightInPixels();
        this.setIconSize(this.lineHeight);
      }
      this.style.marginTop = (this.lineHeight * -2.2) + 'px';
      if (text = this.model.getText(this.lineHeight)) {
        return this.innerHTML = text;
      }
    };

    HoverElement.prototype.createOverlay = function(point) {
      var decoration, editor;
      editor = this.model.vimState.editor;
      if (point == null) {
        point = editor.getCursorBufferPosition();
      }
      this.marker = editor.markBufferPosition(point, {
        invalidate: "never",
        persistent: false
      });
      return decoration = editor.decorateMarker(this.marker, {
        type: 'overlay',
        item: this
      });
    };

    HoverElement.prototype.setIconSize = function(size) {
      var selector, style, _ref;
      if ((_ref = this.styleElement) != null) {
        _ref.remove();
      }
      this.styleElement = document.createElement('style');
      document.head.appendChild(this.styleElement);
      selector = '.vim-mode-plus-hover .icon::before';
      size = "" + (size * 0.8) + "px";
      style = "font-size: " + size + "; width: " + size + "; hegith: " + size + ";";
      return this.styleElement.sheet.addRule(selector, style);
    };

    HoverElement.prototype.reset = function() {
      var _ref, _ref1, _ref2;
      this.className = 'vim-mode-plus-hover';
      this.textContent = '';
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      if ((_ref1 = this.styleElement) != null) {
        _ref1.remove();
      }
      return _ref2 = {}, this.marker = _ref2.marker, this.lineHeight = _ref2.lineHeight, _ref2;
    };

    HoverElement.prototype.destroy = function() {
      var _ref, _ref1;
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      _ref1 = {}, this.model = _ref1.model, this.lineHeight = _ref1.lineHeight;
      return this.remove();
    };

    return HoverElement;

  })(HTMLElement);

  HoverElement = document.registerElement('vim-mode-plus-hover', {
    prototype: HoverElement.prototype,
    "extends": 'div'
  });

  module.exports = {
    Hover: Hover,
    HoverElement: HoverElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hvdmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxpREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxxREFGZCxDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUtNO0FBQ0osUUFBQSxVQUFBOztBQUFBLG9CQUFBLFVBQUEsR0FBWSxJQUFaLENBQUE7O0FBQUEsb0JBQ0EsS0FBQSxHQUFPLElBRFAsQ0FBQTs7QUFHYSxJQUFBLGVBQUUsUUFBRixFQUFhLEtBQWIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFEdUIsSUFBQyxDQUFBLFFBQUEsS0FDeEIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQW5CLENBRFIsQ0FEVztJQUFBLENBSGI7O0FBQUEsb0JBT0EsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBOztRQUFDLFFBQU07T0FDZjthQUFBLElBQUMsQ0FBQSxLQUFELG1CQUFTLFFBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFNLENBQUMsdUJBQWpCLENBQUEsRUFEVDtJQUFBLENBUFYsQ0FBQTs7QUFBQSxvQkFVQSxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ0gsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQUEsQ0FBQTtB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/hover.coffee
