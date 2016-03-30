(function() {
  var Base, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, getKeyBindings, getPackage, getParent, inspectFunction, inspectInstance, inspectObject, keymapsForVimModePlus, packageName, report, sortByAncesstor, util, _,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  getParent = function(obj) {
    var _ref;
    return (_ref = obj.__super__) != null ? _ref.constructor : void 0;
  };

  getAncestors = function(obj) {
    var ancestors, current;
    ancestors = [];
    ancestors.push((current = obj));
    while (current = getParent(current)) {
      ancestors.push(current);
    }
    return ancestors;
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, line, m, superAsIs, superBase, superSignature, superWithModify, _i, _len;
    superBase = _.escapeRegExp("" + fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (_i = 0, _len = fnBody.length; _i < _len; _i++) {
      line = fnBody[_i];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, results, s, superSignature, value, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((_ref = options.excludeProperties) != null ? _ref : []);
    if (options.depth == null) {
      options.depth = 0;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!__hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(__indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        _ref1 = inspectFunction(value, prop), argumentsSignature = _ref1.argumentsSignature, superSignature = _ref1.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = "" + indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, keymaps, klass, pack, prototype, result, results, s, toc, version, _i, _len;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = klasses.length; _i < _len; _i++) {
        klass = klasses[_i];
        _results.push(report(klass, options));
      }
      return _results;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command);
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = ["" + packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var keymap, keystrokes, s, selector, _i, _len;
    s = [];
    s.push('  - keymaps');
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, rep, _ref;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (_ref = options.indent) != null ? _ref : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getPackage = function() {
    return atom.packages.getActivePackage(packageName);
  };

  keymapsForVimModePlus = null;

  getKeyBindings = function() {
    var k, keymapPath;
    if (keymapsForVimModePlus != null) {
      return keymapsForVimModePlus;
    }
    keymapPath = getPackage().getKeymapPaths().pop();
    keymapsForVimModePlus = (function() {
      var _i, _len, _ref, _results;
      _ref = atom.keymaps.getKeyBindings();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (k.source === keymapPath) {
          _results.push(k);
        }
      }
      return _results;
    })();
    return keymapsForVimModePlus;
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  getKeyBindingForCommand = function(command) {
    var keymap, keystrokes, results, selector, _i, _len, _ref;
    results = null;
    _ref = getKeyBindings();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      keymap = _ref[_i];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      if (results == null) {
        results = [];
      }
      results.push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  module.exports = {
    generateIntrospectionReport: generateIntrospectionReport,
    getKeyBindingForCommand: getKeyBindingForCommand,
    inspectInstance: inspectInstance
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ludHJvc3BlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDhVQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLGVBSmQsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsU0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsR0FBQTtXQUNmLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQUEsR0FBZ0IsQ0FBOUIsRUFBaUMsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsRUFBaEIsQ0FBakMsRUFEZTtFQUFBLENBTmpCLENBQUE7O0FBQUEsRUFTQSxTQUFBLEdBQVksU0FBQyxHQUFELEdBQUE7QUFDVixRQUFBLElBQUE7Z0RBQWEsQ0FBRSxxQkFETDtFQUFBLENBVFosQ0FBQTs7QUFBQSxFQVlBLFlBQUEsR0FBZSxTQUFDLEdBQUQsR0FBQTtBQUNiLFFBQUEsa0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBQyxPQUFBLEdBQVEsR0FBVCxDQUFmLENBREEsQ0FBQTtBQUVBLFdBQU0sT0FBQSxHQUFVLFNBQUEsQ0FBVSxPQUFWLENBQWhCLEdBQUE7QUFDRSxNQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZixDQUFBLENBREY7SUFBQSxDQUZBO1dBSUEs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/introspection.coffee
