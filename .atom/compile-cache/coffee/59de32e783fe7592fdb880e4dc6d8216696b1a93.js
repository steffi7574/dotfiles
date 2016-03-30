(function() {
  var Point, Range, SpecError, TextData, VimEditor, dispatch, dispatchKeyboardEvent, dispatchTextEvent, getView, getVimState, inspect, isPoint, isRange, keydown, mockPlatform, packageName, supportedModeClass, swrap, toArray, toArrayOfPoint, toArrayOfRange, unmockPlatform, _, _keystroke, _ref,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  inspect = require('util').inspect;

  swrap = require('../lib/selection-wrapper');

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  packageName = 'vim-mode-plus';

  SpecError = (function() {
    function SpecError(message) {
      this.message = message;
      this.name = 'SpecError';
    }

    return SpecError;

  })();

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  mockPlatform = function(editorElement, platform) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    return wrapper.appendChild(editorElement);
  };

  unmockPlatform = function(editorElement) {
    return editorElement.parentNode.removeChild(editorElement);
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, _arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, shift, _ref1;
    _ref1 = _arg != null ? _arg : {}, element = _ref1.element, ctrl = _ref1.ctrl, shift = _ref1.shift, alt = _ref1.alt, meta = _ref1.meta, raw = _ref1.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    if (element == null) {
      element = document.activeElement;
    }
    eventArgs = [false, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(__slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(__slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(__slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(__slice.call(eventArgs)));
  };

  _keystroke = function(keys, _arg) {
    var element, event, key, _i, _len, _ref1, _results;
    element = _arg.element;
    if (keys === 'escape') {
      return keydown(keys, {
        element: element
      });
    } else {
      _ref1 = keys.split('');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        event = {
          element: element
        };
        if (key.match(/[A-Z]/)) {
          event.shift = true;
        }
        _results.push(keydown(key, event));
      }
      return _results;
    }
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, _ref1;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _ref1 = [], editor = _ref1[0], file = _ref1[1], callback = _ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage(packageName);
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var editorElement, main, pack, vimState;
      pack = atom.packages.getActivePackage(packageName);
      main = pack.mainModule;
      vimState = main.getEditorState(editor);
      editorElement = vimState.editorElement;
      editorElement.addEventListener('keydown', function(e) {
        return atom.keymaps.handleKeyboardEvent(e);
      });
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(row) {
      this.row = row;
      this.lines = this.row.split("\n");
    }

    TextData.prototype.getLines = function(lines, _arg) {
      var chomp, line, text;
      chomp = (_arg != null ? _arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(this.lines[line]);
        }
        return _results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getRaw = function() {
      return this.row;
    };

    return TextData;

  })();

  VimEditor = (function() {
    var ensureOptionsOrdered, setOptionsOrdered;

    function VimEditor(vimState) {
      var _ref1;
      this.vimState = vimState;
      this.keystroke = __bind(this.keystroke, this);
      this.ensure = __bind(this.ensure, this);
      this.set = __bind(this.set, this);
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(__slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new SpecError("" + message + ": " + (inspect(invalidOptions)));
      }
    };

    setOptionsOrdered = ['text', 'grammar', 'cursor', 'cursorBuffer', 'addCursor', 'addCursorBuffer', 'register', 'selectedBufferRange'];

    VimEditor.prototype.set = function(options) {
      var method, name, _i, _len, _results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      _results = [];
      for (_i = 0, _len = setOptionsOrdered.length; _i < _len; _i++) {
        name = setOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setCursorBuffer = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursorBuffer = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, value, _results;
      _results = [];
      for (name in register) {
        value = register[name];
        _results.push(this.vimState.register.set(name, value));
      }
      return _results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'selectedText', 'selectedTextOrdered', 'cursor', 'cursorBuffer', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'characterwiseHead', 'scrollTop', 'mode'];

    VimEditor.prototype.ensure = function() {
      var args, keystroke, method, name, options, _i, _len, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke);
      }
      _results = [];
      for (_i = 0, _len = ensureOptionsOrdered.length; _i < _len; _i++) {
        name = ensureOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(s.getText());
        }
        return _results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorBuffer = function(points) {
      var actual;
      actual = this.editor.getCursorBufferPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var ensure, name, property, reg, _results, _value;
      _results = [];
      for (name in register) {
        ensure = register[name];
        reg = this.vimState.register.get(name);
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            _results1.push(expect(reg[property]).toEqual(_value));
          }
          return _results1;
        })());
      }
      return _results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(fn(s));
        }
        return _results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual;
      actual = this.editor.getLastSelection().isReversed();
      return expect(actual).toBe(reversed);
    };

    VimEditor.prototype.ensureCharacterwiseHead = function(points) {
      var actual, s;
      actual = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getSelections();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          s = _ref1[_i];
          _results.push(swrap(s).getCharacterwiseHeadPosition());
        }
        return _results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var m, shouldNotContainClasses, _i, _j, _len, _len1, _ref1, _results;
      mode = toArray(mode);
      expect((_ref1 = this.vimState).isMode.apply(_ref1, mode)).toBe(true);
      mode[0] = "" + mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (_i = 0, _len = mode.length; _i < _len; _i++) {
        m = mode[_i];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      _results = [];
      for (_j = 0, _len1 = shouldNotContainClasses.length; _j < _len1; _j++) {
        m = shouldNotContainClasses[_j];
        _results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return _results;
    };

    VimEditor.prototype.keystroke = function(keys, _arg) {
      var c, chars, editor, editorElement, element, k, mocked, _i, _j, _len, _len1, _ref1, _ref2;
      element = (_arg != null ? _arg : {}).element;
      if (element == null) {
        element = this.editorElement;
      }
      mocked = null;
      if (!_.isArray(keys)) {
        keys = [keys];
      }
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        k = keys[_i];
        if (_.isString(k)) {
          _keystroke(k, {
            element: element
          });
        } else {
          switch (false) {
            case k.platform == null:
              mockPlatform(element, k.platform);
              mocked = true;
              break;
            case k.char == null:
              chars = (_ref1 = k.char) === '' || _ref1 === 'escape' ? toArray(k.char) : k.char.split('');
              for (_j = 0, _len1 = chars.length; _j < _len1; _j++) {
                c = chars[_j];
                this.vimState.input.view.editor.insertText(c);
              }
              break;
            case k.search == null:
              _ref2 = this.vimState.searchInput.view, editor = _ref2.editor, editorElement = _ref2.editorElement;
              editor.insertText(k.search);
              atom.commands.dispatch(editorElement, 'core:confirm');
              break;
            case k.ctrl == null:
              keydown(k.ctrl, {
                ctrl: true,
                element: element
              });
              break;
            case k.raw == null:
              keydown(k.raw, {
                raw: true,
                element: element
              });
          }
        }
      }
      if (mocked) {
        return unmockPlatform(element);
      }
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsOFJBQUE7SUFBQTtzRkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUVDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDBCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLGtCQUFBLEdBQXFCLENBQ25CLGFBRG1CLEVBRW5CLGFBRm1CLEVBR25CLGFBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFVBTG1CLEVBTW5CLFdBTm1CLEVBT25CLGVBUG1CLENBTHJCLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsZUFmZCxDQUFBOztBQUFBLEVBZ0JNO0FBQ1MsSUFBQSxtQkFBRSxPQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxXQUFSLENBRFc7SUFBQSxDQUFiOztxQkFBQTs7TUFqQkYsQ0FBQTs7QUFBQSxFQXNCQSxPQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7V0FDUixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsS0FBbkIsRUFEUTtFQUFBLENBdEJWLENBQUE7O0FBQUEsRUF5QkEsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtXQUNULElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixPQUEvQixFQURTO0VBQUEsQ0F6QlgsQ0FBQTs7QUFBQSxFQTRCQSxZQUFBLEdBQWUsU0FBQyxhQUFELEVBQWdCLFFBQWhCLEdBQUE7QUFDYixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFWLENBQUE7QUFBQSxJQUNBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLFFBRHBCLENBQUE7V0FFQSxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQixFQUhhO0VBQUEsQ0E1QmYsQ0FBQTs7QUFBQSxFQWlDQSxjQUFBLEdBQWlCLFNBQUMsYUFBRCxHQUFBO1dBQ2YsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUF6QixDQUFxQyxhQUFyQyxFQURlO0VBQUEsQ0FqQ2pCLENBQUE7O0FBQUEsRUFvQ0EscUJBQUEsR0FBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsb0JBQUE7QUFBQSxJQUR1Qix1QkFBUSxtRUFDL0IsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxXQUFULENBQXFCLGVBQXJCLENBQUosQ0FBQTtBQUFBLElBQ0EsQ0FBQyxDQUFDLGlCQUFGLFVBQW9CLFNBQXBCLENBREEsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLENBQWhCO0FBQ0UsTUFBQSxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUF0QixFQUF5QixTQUF6QixFQUFvQztBQUFBLFFBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTtpQkFBRyxPQUFIO1FBQUEsQ0FBTDtPQUFwQyxDQUFBLENBREY7S0FIQTtXQUtBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLENBQXJCLEVBTnNCO0VBQUEsQ0FwQ3hCLENBQUE7O0FBQUEsRUE0Q0EsaUJBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFFBQUEsb0JBQUE7QUFBQSxJQURtQix1QkFBUSxtRUFDM0IsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxXQUFULENBQXFCLFdBQXJCLENBQUosQ0FBQTtBQUFBLElBQ0EsQ0FBQyxDQUFDLGFBQUYsVUFBZ0IsU0FBaEIsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsQ0FBckIsRUFIa0I7RUFBQSxDQTVDcEIsQ0FBQTs7QUFBQSxFQWlEQSxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBO0FBQ1IsUUFBQSxnRUFBQTtBQUFBLDJCQURjLE9BQXVDLElBQXRDLGdCQUFBLFNBQVMsYUFBQSxNQUFNLGNBQUEsT0FBTyxZQUFBLEtBQUssYUFBQSxNQUFNLFlBQUEsR0FDaEQsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQUFBLENBQU8sR0FBQSxLQUFPLFFBQVAsSUFBbUIsYUFBMUIsQ0FBQTtBQUNFLE1BQUEsR0FBQSxHQUFPLElBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFKLENBQWUsQ0FBZixDQUFpQixDQUFDLFFBQWxCLENBQTJCLEVBQTNCLENBQUQsQ0FBVixDQURGO0tBQUE7O01BRUEsVUFBVyxRQUFRLENBQUM7S0FGcEI7QUFBQSxJQUdBLFNBQUEsR0FBWSxDQUNWLEtBRFUsRUFFVixJQUZVLEVBR1YsSUFIVSxFQUlWLEdBSlUsRUFLVixDQUxVLEVBTVYsSUFOVSxFQU1KLEdBTkksRUFNQyxLQU5ELEVBTVEsSUFOUixDQUhaLENBQUE7QUFBQSxJQVlBLFFBQUEsR0FBVyxDQUFBLHFCQUFJLGFBQXNCLENBQUEsT0FBQSxFQUFTLFNBQVcsU0FBQSxhQUFBLFNBQUEsQ0FBQSxDQUExQyxDQVpmLENBQUE7QUFBQSxJQWNBLHFCQUFBLGFBQXNCLENBQUEsT0FBQSxFQUFTLFVBQVksU0FBQSxhQUFBLFNBQUEsQ0FBQSxDQUEzQyxDQWRBLENBQUE7QUFlQSxJQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0UsTUFBQSxJQUFHLGlCQUFBLGFBQWtCLENBQUEsT0FBQSxFQUFTLFdBQWEsU0FBQSxhQUFBLFNBQUEsQ0FBQSxDQUF4QyxDQUFIO0FBQ0UsUUFBQSxPQUFPLENBQUMsS0FBUixJQUFpQixHQUFqQixDQURGO09BREY7S0FmQTtXQWtCQSxxQkFBQSxhQUFzQixDQUFBLE9BQUEsRUFBUyxPQUFTLFNBQUEsYUFBQSxTQUFBLENBQUEsQ0FBeEMsRUFuQlE7RUFBQSxDQWpEVixDQUFBOztBQUFBLEVBc0VBLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFDWCxRQUFBLDhDQUFBO0FBQUEsSUFEbUIsVUFBRCxLQUFDLE9BQ25CLENBQUE7QUFBQSxJQUFBLElBQUcsSUFBQSxLQUFRLFFBQVg7YUFDRSxPQUFBLENBQVEsSUFBUixFQUFjO0FBQUEsUUFBQyxTQUFBLE9BQUQ7T0FBZCxFQURGO0tBQUEsTUFBQTtBQUdFO0FBQUE7V0FBQSw0Q0FBQTt3QkFBQTtBQUNFLFFBQUEsS0FBQSxHQUFRO0FBQUEsVUFBQyxTQUFBLE9BQUQ7U0FBUixDQUFBO0FBQ0EsUUFBQSxJQUFzQixHQUFHLENBQUMsS0FBSixDQUFVLE9BQVYsQ0FBdEI7QUFBQSxVQUFBLEtBQUssQ0FBQyxLQUFOLEdBQWMsSUFBZCxDQUFBO1NBREE7QUFBQSxzQkFFQSxPQUFBLENBQVEsR0FBUixFQUFhLEtBQWIsRUFGQSxDQURGO0FBQUE7c0JBSEY7S0FEVztFQUFBLENBdEViLENBQUE7O0FBQUEsRUErRUEsT0FBQSxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1IsSUFBQSxJQUFHLEdBQUEsWUFBZSxLQUFsQjthQUNFLEtBREY7S0FBQSxNQUFBO2FBR0UsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFkLElBQW9CLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBSSxDQUFBLENBQUEsQ0FBZixDQUFwQixJQUEyQyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUksQ0FBQSxDQUFBLENBQWYsRUFIN0M7S0FEUTtFQUFBLENBL0VWLENBQUE7O0FBQUEsRUFxRkEsT0FBQSxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1IsSUFBQSxJQUFHLEdBQUEsWUFBZSxLQUFsQjthQUNFLEtBREY7S0FBQSxNQUFBO2FBR0UsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUNKLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixDQURJLEVBRUgsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUZYLEVBR0osT0FBQSxDQUFRLEdBQUksQ0FBQSxDQUFBLENBQVosQ0FISSxFQUlKLE9BQUEsQ0FBUSxHQUFJLENBQUEsQ0FBQSxDQUFaLENBSkksQ0FBTixFQUhGO0tBRFE7RUFBQSxDQXJGVixDQUFBOztBQUFBLEVBZ0dBLE9BQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7O01BQU0sT0FBSztLQUNuQjtBQUFBLElBQUEsSUFBRyxDQUFDLENBQUMsT0FBRixnQkFBVSxPQUFPLEdBQWpCLENBQUg7YUFBOEIsSUFBOUI7S0FBQSxNQUFBO2FBQXVDLENBQUMsR0FBRCxFQUF2QztLQURRO0VBQUEsQ0FoR1YsQ0FBQTs7QUFBQSxFQW1HQSxjQUFBLEdBQWlCLFNBQUMsR0FBRCxHQUFBO0FBQ2YsSUFBQSxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixDQUFBLElBQW1CLE9BQUEsQ0FBUSxHQUFJLENBQUEsQ0FBQSxDQUFaLENBQXRCO2FBQ0UsSUFERjtLQUFBLE1BQUE7YUFHRSxDQUFDLEdBQUQsRUFIRjtLQURlO0VBQUEsQ0FuR2pCLENBQUE7O0FBQUEsRUF5R0EsY0FBQSxHQUFpQixTQUFDLEdBQUQsR0FBQTtBQUNmLElBQUEsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FBQSxJQUFtQixDQUFDLENBQUMsR0FBRixDQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFELEdBQUE7YUFBTyxPQUFBLENBQVEsQ0FBUixFQUFQO0lBQUEsQ0FBUixDQUFOLENBQXRCO2FBQ0UsSUFERjtLQUFBLE1BQUE7YUFHRSxDQUFDLEdBQUQsRUFIRjtLQURlO0VBQUEsQ0F6R2pCLENBQUE7O0FBQUEsRUFpSEEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsbUNBQUE7QUFBQSxJQURhLDhEQUNiLENBQUE7QUFBQSxJQUFBLFFBQTJCLEVBQTNCLEVBQUMsaUJBQUQsRUFBUyxlQUFULEVBQWUsbUJBQWYsQ0FBQTtBQUNBLFlBQU8sSUFBSSxDQUFDLE1BQVo7QUFBQSxXQUNPLENBRFA7QUFDYyxRQUFDLFdBQVksT0FBYixDQURkO0FBQ087QUFEUCxXQUVPLENBRlA7QUFFYyxRQUFDLGNBQUQsRUFBTyxrQkFBUCxDQUZkO0FBQUEsS0FEQTtBQUFBLElBS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7YUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsV0FBOUIsRUFEYztJQUFBLENBQWhCLENBTEEsQ0FBQTtBQUFBLElBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxNQUFBLElBQXlDLElBQXpDO0FBQUEsUUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFiLENBQXlCLElBQXpCLENBQVAsQ0FBQTtPQUFBO2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsU0FBQyxDQUFELEdBQUE7ZUFDN0IsTUFBQSxHQUFTLEVBRG9CO01BQUEsQ0FBL0IsRUFGYztJQUFBLENBQWhCLENBUkEsQ0FBQTtXQWFBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLG1DQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQixDQUFQLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsVUFEWixDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsTUFBcEIsQ0FGWCxDQUFBO0FBQUEsTUFHQyxnQkFBaUIsU0FBakIsYUFIRCxDQUFBO0FBQUEsTUFJQSxhQUFhLENBQUMsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMEMsU0FBQyxDQUFELEdBQUE7ZUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBYixDQUFpQyxDQUFqQyxFQUR3QztNQUFBLENBQTFDLENBSkEsQ0FBQTthQU9BLFFBQUEsQ0FBUyxRQUFULEVBQXVCLElBQUEsU0FBQSxDQUFVLFFBQVYsQ0FBdkIsRUFSRztJQUFBLENBQUwsRUFkWTtFQUFBLENBakhkLENBQUE7O0FBQUEsRUF5SU07QUFDUyxJQUFBLGtCQUFFLEdBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLE1BQUEsR0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBVCxDQURXO0lBQUEsQ0FBYjs7QUFBQSx1QkFHQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1IsVUFBQSxpQkFBQTtBQUFBLE1BRGlCLHdCQUFELE9BQVEsSUFBUCxLQUNqQixDQUFBOztRQUFBLFFBQVM7T0FBVDtBQUFBLE1BQ0EsSUFBQSxHQUFPOztBQUFDO2FBQUEsNENBQUE7MkJBQUE7QUFBQSx3QkFBQSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsRUFBUCxDQUFBO0FBQUE7O21CQUFELENBQWdDLENBQUMsSUFBakMsQ0FBc0MsSUFBdEMsQ0FEUCxDQUFBO0FBRUEsTUFBQSxJQUFHLEtBQUg7ZUFDRSxLQURGO09BQUEsTUFBQTtlQUdFLElBQUEsR0FBTyxLQUhUO09BSFE7SUFBQSxDQUhWLENBQUE7O0FBQUEsdUJBV0EsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQURLO0lBQUEsQ0FYUixDQUFBOztvQkFBQTs7TUExSUYsQ0FBQTs7QUFBQSxFQXdKTTtBQUNKLFFBQUEsdUNBQUE7O0FBQWEsSUFBQSxtQkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLEtBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsdUNBQUEsQ0FBQTtBQUFBLE1BQUEsUUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGVBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxzQkFBQSxhQUFYLENBRFc7SUFBQSxDQUFiOztBQUFBLHdCQUdBLGVBQUEsR0FBaUIsU0FBQyxPQUFELEVBQVUsWUFBVixFQUF3QixPQUF4QixHQUFBO0FBQ2YsVUFBQSxjQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxPQUFGLFVBQVUsQ0FBQSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVAsQ0FBaUIsU0FBQSxhQUFBLFlBQUEsQ0FBQSxDQUEzQixDQUFqQixDQUFBO0FBQ0EsTUFBQSxJQUFHLGNBQWMsQ0FBQyxNQUFsQjtBQUNFLGNBQVUsSUFBQSxTQUFBLENBQVUsRUFBQSxHQUFHLE9BQUgsR0FBVyxJQUFYLEdBQWMsQ0FBQyxPQUFBLENBQVEsY0FBUixDQUFELENBQXhCLENBQVYsQ0FERjtPQUZlO0lBQUEsQ0FIakIsQ0FBQTs7QUFBQSxJQVFBLGlCQUFBLEdBQW9CLENBQ2xCLE1BRGtCLEVBRWxCLFNBRmtCLEVBR2xCLFFBSGtCLEVBR1IsY0FIUSxFQUlsQixXQUprQixFQUlMLGlCQUpLLEVBS2xCLFVBTGtCLEVBTWxCLHFCQU5rQixDQVJwQixDQUFBOztBQUFBLHdCQWtCQSxHQUFBLEdBQUssU0FBQyxPQUFELEdBQUE7QUFDSCxVQUFBLGdDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsZUFBRCxDQUFpQixPQUFqQixFQUEwQixpQkFBMUIsRUFBNkMscUJBQTdDLENBQUEsQ0FBQTtBQUNBO1dBQUEsd0RBQUE7cUNBQUE7Y0FBbUM7O1NBQ2pDO0FBQUEsUUFBQSxNQUFBLEdBQVMsS0FBQSxHQUFRLENBQUMsQ0FBQyxVQUFGLENBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLENBQWIsQ0FBakIsQ0FBQTtBQUFBLHNCQUNBLElBQUssQ0FBQSxNQUFBLENBQUwsQ0FBYSxPQUFRLENBQUEsSUFBQSxDQUFyQixFQURBLENBREY7QUFBQTtzQkFGRztJQUFBLENBbEJMLENBQUE7O0FBQUEsd0JBd0JBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTthQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixJQUFoQixFQURPO0lBQUEsQ0F4QlQsQ0FBQTs7QUFBQSx3QkEyQkEsVUFBQSxHQUFZLFNBQUMsS0FBRCxHQUFBO2FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsS0FBbEMsQ0FBbkIsRUFEVTtJQUFBLENBM0JaLENBQUE7O0FBQUEsd0JBOEJBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULFVBQUEseUJBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxjQUFBLENBQWUsTUFBZixDQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFoQyxDQURBLENBQUE7QUFFQTtXQUFBLDZDQUFBOzJCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxLQUFsQyxFQUFBLENBREY7QUFBQTtzQkFIUztJQUFBLENBOUJYLENBQUE7O0FBQUEsd0JBb0NBLGVBQUEsR0FBaUIsU0FBQyxNQUFELEdBQUE7QUFDZixVQUFBLHlCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsY0FBQSxDQUFlLE1BQWYsQ0FBVCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FBaEMsQ0FEQSxDQUFBO0FBRUE7V0FBQSw2Q0FBQTsyQkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsS0FBbEMsRUFBQSxDQURGO0FBQUE7c0JBSGU7SUFBQSxDQXBDakIsQ0FBQTs7QUFBQSx3QkEwQ0EsWUFBQSxHQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ1osVUFBQSxnQ0FBQTtBQUFBO0FBQUE7V0FBQSw0Q0FBQTswQkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsS0FBbEMsRUFBQSxDQURGO0FBQUE7c0JBRFk7SUFBQSxDQTFDZCxDQUFBOztBQUFBLHdCQThDQSxrQkFBQSxHQUFvQixTQUFDLE1BQUQsR0FBQTtBQUNsQixVQUFBLGdDQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBOzBCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxLQUFsQyxFQUFBLENBREY7QUFBQTtzQkFEa0I7SUFBQSxDQTlDcEIsQ0FBQTs7QUFBQSx3QkFrREEsV0FBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ1gsVUFBQSxxQkFBQTtBQUFBO1dBQUEsZ0JBQUE7K0JBQUE7QUFDRSxzQkFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixJQUF2QixFQUE2QixLQUE3QixFQUFBLENBREY7QUFBQTtzQkFEVztJQUFBLENBbERiLENBQUE7O0FBQUEsd0JBc0RBLHNCQUFBLEdBQXdCLFNBQUMsS0FBRCxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBK0IsS0FBL0IsRUFEc0I7SUFBQSxDQXREeEIsQ0FBQTs7QUFBQSxJQXlEQSxvQkFBQSxHQUF1QixDQUNyQixNQURxQixFQUVyQixjQUZxQixFQUVMLHFCQUZLLEVBR3JCLFFBSHFCLEVBR1gsY0FIVyxFQUlyQixZQUpxQixFQUtyQixVQUxxQixFQU1yQixxQkFOcUIsRUFNRSw0QkFORixFQU9yQixxQkFQcUIsRUFPRSw0QkFQRixFQVFyQixxQkFScUIsRUFTckIsbUJBVHFCLEVBVXJCLFdBVnFCLEVBV3JCLE1BWHFCLENBekR2QixDQUFBOztBQUFBLHdCQXVFQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSwwREFBQTtBQUFBLE1BRE8sOERBQ1AsQ0FBQTtBQUFBLGNBQU8sSUFBSSxDQUFDLE1BQVo7QUFBQSxhQUNPLENBRFA7QUFDYyxVQUFDLFVBQVcsT0FBWixDQURkO0FBQ087QUFEUCxhQUVPLENBRlA7QUFFYyxVQUFDLG1CQUFELEVBQVksaUJBQVosQ0FGZDtBQUFBLE9BQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLEVBQTBCLG9CQUExQixFQUFnRCx1QkFBaEQsQ0FIQSxDQUFBO0FBS0EsTUFBQSxJQUFBLENBQUEsQ0FBUSxDQUFDLE9BQUYsQ0FBVSxTQUFWLENBQVA7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxDQUFBLENBREY7T0FMQTtBQVFBO1dBQUEsMkRBQUE7d0NBQUE7Y0FBc0M7O1NBQ3BDO0FBQUEsUUFBQSxNQUFBLEdBQVMsUUFBQSxHQUFXLENBQUMsQ0FBQyxVQUFGLENBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLENBQWIsQ0FBcEIsQ0FBQTtBQUFBLHNCQUNBLElBQUssQ0FBQSxNQUFBLENBQUwsQ0FBYSxPQUFRLENBQUEsSUFBQSxDQUFyQixFQURBLENBREY7QUFBQTtzQkFUTTtJQUFBLENBdkVSLENBQUE7O0FBQUEsd0JBb0ZBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLE1BQUEsQ0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUFQLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsSUFBbEMsRUFEVTtJQUFBLENBcEZaLENBQUE7O0FBQUEsd0JBdUZBLGtCQUFBLEdBQW9CLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNsQixVQUFBLHFCQUFBOztRQUR5QixVQUFRO09BQ2pDO0FBQUEsTUFBQSxVQUFBLEdBQWdCLE9BQUgsR0FDWCxJQUFDLENBQUEsTUFBTSxDQUFDLG9DQUFSLENBQUEsQ0FEVyxHQUdYLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBSEYsQ0FBQTtBQUFBLE1BSUEsTUFBQTs7QUFBVTthQUFBLGlEQUFBOzZCQUFBO0FBQUEsd0JBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxFQUFBLENBQUE7QUFBQTs7VUFKVixDQUFBO2FBS0EsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsT0FBQSxDQUFRLElBQVIsQ0FBdkIsRUFOa0I7SUFBQSxDQXZGcEIsQ0FBQTs7QUFBQSx3QkErRkEseUJBQUEsR0FBMkIsU0FBQyxJQUFELEdBQUE7YUFDekIsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLElBQTFCLEVBRHlCO0lBQUEsQ0EvRjNCLENBQUE7O0FBQUEsd0JBa0dBLFlBQUEsR0FBYyxTQUFDLE1BQUQsR0FBQTtBQUNaLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBQSxDQUFULENBQUE7YUFDQSxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsT0FBZixDQUF1QixjQUFBLENBQWUsTUFBZixDQUF2QixFQUZZO0lBQUEsQ0FsR2QsQ0FBQTs7QUFBQSx3QkFzR0Esa0JBQUEsR0FBb0IsU0FBQyxNQUFELEdBQUE7QUFDbEIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyx3QkFBUixDQUFBLENBQVQsQ0FBQTthQUNBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGNBQUEsQ0FBZSxNQUFmLENBQXZCLEVBRmtCO0lBQUEsQ0F0R3BCLENBQUE7O0FBQUEsd0JBMEdBLGNBQUEsR0FBZ0IsU0FBQyxRQUFELEdBQUE7QUFDZCxVQUFBLDZDQUFBO0FBQUE7V0FBQSxnQkFBQTtnQ0FBQTtBQUNFLFFBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLElBQXZCLENBQU4sQ0FBQTtBQUFBOztBQUNBO2VBQUEsa0JBQUE7c0NBQUE7QUFDRSwyQkFBQSxNQUFBLENBQU8sR0FBSSxDQUFBLFFBQUEsQ0FBWCxDQUFxQixDQUFDLE9BQXRCLENBQThCLE1BQTlCLEVBQUEsQ0FERjtBQUFBOzthQURBLENBREY7QUFBQTtzQkFEYztJQUFBLENBMUdoQixDQUFBOztBQUFBLHdCQWdIQSxnQkFBQSxHQUFrQixTQUFDLE1BQUQsR0FBQTthQUNoQixNQUFBLENBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBUCxDQUE0QixDQUFDLFlBQTdCLENBQTBDLE1BQTFDLEVBRGdCO0lBQUEsQ0FoSGxCLENBQUE7O0FBQUEsd0JBbUhBLHNCQUFBLEdBQXdCLFNBQUMsS0FBRCxFQUFRLE9BQVIsRUFBdUIsRUFBdkIsR0FBQTtBQUN0QixVQUFBLHFCQUFBOztRQUQ4QixVQUFRO09BQ3RDO0FBQUEsTUFBQSxVQUFBLEdBQWdCLE9BQUgsR0FDWCxJQUFDLENBQUEsTUFBTSxDQUFDLG9DQUFSLENBQUEsQ0FEVyxHQUdYLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBSEYsQ0FBQTtBQUFBLE1BSUEsTUFBQTs7QUFBVTthQUFBLGlEQUFBOzZCQUFBO0FBQUEsd0JBQUEsRUFBQSxDQUFHLENBQUgsRUFBQSxDQUFBO0FBQUE7O1VBSlYsQ0FBQTthQUtBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGNBQUEsQ0FBZSxLQUFmLENBQXZCLEVBTnNCO0lBQUEsQ0FuSHhCLENBQUE7O0FBQUEsd0JBMkhBLHlCQUFBLEdBQTJCLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTs7UUFBUSxVQUFRO09BQ3pDO2FBQUEsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCLEVBQStCLE9BQS9CLEVBQXdDLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBQSxFQUFQO01BQUEsQ0FBeEMsRUFEeUI7SUFBQSxDQTNIM0IsQ0FBQTs7QUFBQSx3QkE4SEEsZ0NBQUEsR0FBa0MsU0FBQyxLQUFELEdBQUE7YUFDaEMsSUFBQyxDQUFBLHlCQUFELENBQTJCLEtBQTNCLEVBQWtDLElBQWxDLEVBRGdDO0lBQUEsQ0E5SGxDLENBQUE7O0FBQUEsd0JBaUlBLHlCQUFBLEdBQTJCLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTs7UUFBUSxVQUFRO09BQ3pDO2FBQUEsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCLEVBQStCLE9BQS9CLEVBQXdDLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBQSxFQUFQO01BQUEsQ0FBeEMsRUFEeUI7SUFBQSxDQWpJM0IsQ0FBQTs7QUFBQSx3QkFvSUEsZ0NBQUEsR0FBa0MsU0FBQyxLQUFELEdBQUE7YUFDaEMsSUFBQyxDQUFBLHlCQUFELENBQTJCLEtBQTNCLEVBQWtDLElBQWxDLEVBRGdDO0lBQUEsQ0FwSWxDLENBQUE7O0FBQUEsd0JBdUlBLHlCQUFBLEdBQTJCLFNBQUMsUUFBRCxHQUFBO0FBQ3pCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUEwQixDQUFDLFVBQTNCLENBQUEsQ0FBVCxDQUFBO2FBQ0EsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsRUFGeUI7SUFBQSxDQXZJM0IsQ0FBQTs7QUFBQSx3QkEySUEsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEdBQUE7QUFDdkIsVUFBQSxTQUFBO0FBQUEsTUFBQSxNQUFBOztBQUFVO0FBQUE7YUFBQSw0Q0FBQTt3QkFBQTtBQUFBLHdCQUFBLEtBQUEsQ0FBTSxDQUFOLENBQVEsQ0FBQyw0QkFBVCxDQUFBLEVBQUEsQ0FBQTtBQUFBOzttQkFBVixDQUFBO2FBQ0EsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsY0FBQSxDQUFlLE1BQWYsQ0FBdkIsRUFGdUI7SUFBQSxDQTNJekIsQ0FBQTs7QUFBQSx3QkErSUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUFBLENBQVQsQ0FBQTthQUNBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLFNBQXZCLEVBRmU7SUFBQSxDQS9JakIsQ0FBQTs7QUFBQSx3QkFtSkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxnRUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSLENBQVAsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLFNBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBUyxDQUFDLE1BQVYsY0FBaUIsSUFBakIsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQXZDLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLEVBQUEsR0FBRyxJQUFLLENBQUEsQ0FBQSxDQUFSLEdBQVcsT0FIckIsQ0FBQTtBQUFBLE1BSUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQVksU0FBQyxDQUFELEdBQUE7ZUFBTyxFQUFQO01BQUEsQ0FBWixDQUpQLENBQUE7QUFBQSxNQUtBLE1BQUEsQ0FBTyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxlQUFsQyxDQUFQLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsSUFBaEUsQ0FMQSxDQUFBO0FBTUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLENBQWxDLENBQVAsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxJQUFsRCxDQUFBLENBREY7QUFBQSxPQU5BO0FBQUEsTUFRQSx1QkFBQSxHQUEwQixDQUFDLENBQUMsVUFBRixDQUFhLGtCQUFiLEVBQWlDLElBQWpDLENBUjFCLENBQUE7QUFTQTtXQUFBLGdFQUFBO3dDQUFBO0FBQ0Usc0JBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLENBQWxDLENBQVAsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxLQUFsRCxFQUFBLENBREY7QUFBQTtzQkFWVTtJQUFBLENBbkpaLENBQUE7O0FBQUEsd0JBaUtBLFNBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFHVCxVQUFBLHNGQUFBO0FBQUEsTUFIaUIsMEJBQUQsT0FBVSxJQUFULE9BR2pCLENBQUE7O1FBQUEsVUFBVyxJQUFDLENBQUE7T0FBWjtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBRFQsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLENBQXNCLENBQUMsT0FBRixDQUFVLElBQVYsQ0FBckI7QUFBQSxRQUFBLElBQUEsR0FBTyxDQUFDLElBQUQsQ0FBUCxDQUFBO09BRkE7QUFJQSxXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsQ0FBWCxDQUFIO0FBQ0UsVUFBQSxVQUFBLENBQVcsQ0FBWCxFQUFjO0FBQUEsWUFBQyxTQUFBLE9BQUQ7V0FBZCxDQUFBLENBREY7U0FBQSxNQUFBO0FBR0Usa0JBQUEsS0FBQTtBQUFBLGlCQUNPLGtCQURQO0FBRUksY0FBQSxZQUFBLENBQWEsT0FBYixFQUFzQixDQUFDLENBQUMsUUFBeEIsQ0FBQSxDQUFBO0FBQUEsY0FDQSxNQUFBLEdBQVMsSUFEVCxDQUZKO0FBQ087QUFEUCxpQkFJTyxjQUpQO0FBS0ksY0FBQSxLQUFBLFlBRUssQ0FBQyxDQUFDLEtBQUYsS0FBVyxFQUFYLElBQUEsS0FBQSxLQUFlLFFBQWxCLEdBQ0UsT0FBQSxDQUFRLENBQUMsQ0FBQyxJQUFWLENBREYsR0FHRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQVAsQ0FBYSxFQUFiLENBTEosQ0FBQTtBQU1BLG1CQUFBLDhDQUFBOzhCQUFBO0FBQ0UsZ0JBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUE1QixDQUF1QyxDQUF2QyxDQUFBLENBREY7QUFBQSxlQVhKO0FBSU87QUFKUCxpQkFhTyxnQkFiUDtBQWNJLGNBQUEsUUFBMEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBaEQsRUFBQyxlQUFBLE1BQUQsRUFBUyxzQkFBQSxhQUFULENBQUE7QUFBQSxjQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLENBQUMsQ0FBQyxNQUFwQixDQURBLENBQUE7QUFBQSxjQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixhQUF2QixFQUFzQyxjQUF0QyxDQUZBLENBZEo7QUFhTztBQWJQLGlCQWlCTyxjQWpCUDtBQWlCcUIsY0FBQSxPQUFBLENBQVEsQ0FBQyxDQUFDLElBQVYsRUFBZ0I7QUFBQSxnQkFBQyxJQUFBLEVBQU0sSUFBUDtBQUFBLGdCQUFhLFNBQUEsT0FBYjtlQUFoQixDQUFBLENBakJyQjtBQWlCTztBQWpCUCxpQkFrQk8sYUFsQlA7QUFrQnFCLGNBQUEsT0FBQSxDQUFRLENBQUMsQ0FBQyxHQUFWLEVBQWU7QUFBQSxnQkFBQyxHQUFBLEVBQUssSUFBTjtBQUFBLGdCQUFZLFNBQUEsT0FBWjtlQUFmLENBQUEsQ0FsQnJCO0FBQUEsV0FIRjtTQURGO0FBQUEsT0FKQTtBQTJCQSxNQUFBLElBQUcsTUFBSDtlQUNFLGNBQUEsQ0FBZSxPQUFmLEVBREY7T0E5QlM7SUFBQSxDQWpLWCxDQUFBOztxQkFBQTs7TUF6SkYsQ0FBQTs7QUFBQSxFQTJWQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsYUFBQSxXQUFEO0FBQUEsSUFBYyxTQUFBLE9BQWQ7QUFBQSxJQUF1QixVQUFBLFFBQXZCO0FBQUEsSUFBaUMsVUFBQSxRQUFqQztHQTNWakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/spec-helper.coffee
