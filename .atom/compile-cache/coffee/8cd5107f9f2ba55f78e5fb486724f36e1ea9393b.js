(function() {
  var Settings;

  Settings = (function() {
    function Settings(scope, config) {
      this.scope = scope;
      this.config = config;
    }

    Settings.prototype.get = function(param) {
      if (param === 'defaultRegister') {
        if (this.get('useClipboardAsDefaultRegister')) {
          return '*';
        } else {
          return '"';
        }
      } else {
        return atom.config.get("" + this.scope + "." + param);
      }
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set("" + this.scope + "." + param, value);
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    setCursorToStartOfChangeOnUndoRedo: {
      order: 1,
      type: 'boolean',
      "default": false
    },
    useClipboardAsDefaultRegister: {
      order: 2,
      type: 'boolean',
      "default": false
    },
    startInInsertMode: {
      order: 3,
      type: 'boolean',
      "default": false
    },
    wrapLeftRightMotion: {
      order: 4,
      type: 'boolean',
      "default": false
    },
    numberRegex: {
      order: 5,
      type: 'string',
      "default": '-?[0-9]+',
      description: 'Used to find number in ctrl-a/ctrl-x. To ignore "-"(minus) char in string like "identifier-1" use "(?:\\B-)?[0-9]+"'
    },
    showCursorInVisualMode: {
      order: 6,
      type: 'boolean',
      "default": true
    },
    useSmartcaseForSearch: {
      order: 7,
      type: 'boolean',
      "default": false
    },
    incrementalSearch: {
      order: 8,
      type: 'boolean',
      "default": false
    },
    stayOnTransformString: {
      order: 9,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after TransformString e.g Toggle, Surround"
    },
    stayOnYank: {
      order: 10,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after Yank"
    },
    flashOnUndoRedo: {
      order: 14,
      type: 'boolean',
      "default": false
    },
    flashOnUndoRedoDuration: {
      order: 15,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperate: {
      order: 16,
      type: 'boolean',
      "default": true
    },
    flashOnOperateDuration: {
      order: 17,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperateBlacklist: {
      order: 18,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'comma separated list of operator class name to disable flash e.g. "Yank, AutoIndent"'
    },
    flashOnSearch: {
      order: 19,
      type: 'boolean',
      "default": true
    },
    flashOnSearchDuration: {
      order: 20,
      type: 'integer',
      "default": 300,
      description: "Duration(msec) for search flash"
    },
    flashScreenOnSearchHasNoMatch: {
      order: 21,
      type: 'boolean',
      "default": true
    },
    showHoverOnOperate: {
      order: 22,
      type: 'boolean',
      "default": false,
      description: "Show count, register and optional icon on hover overlay"
    },
    showHoverOnOperateIcon: {
      order: 23,
      type: 'string',
      "default": 'icon',
      "enum": ['none', 'icon', 'emoji']
    },
    showHoverSearchCounter: {
      order: 24,
      type: 'boolean',
      "default": false
    },
    showHoverSearchCounterDuration: {
      order: 25,
      type: 'integer',
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    throwErrorOnNonEmptySelectionInNormalMode: {
      order: 101,
      type: 'boolean',
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQU07QUFDUyxJQUFBLGtCQUFFLEtBQUYsRUFBVSxNQUFWLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLFFBQUEsS0FBaUIsQ0FBQTtBQUFBLE1BQVYsSUFBQyxDQUFBLFNBQUEsTUFBUyxDQUFuQjtJQUFBLENBQWI7O0FBQUEsdUJBRUEsR0FBQSxHQUFLLFNBQUMsS0FBRCxHQUFBO0FBQ0gsTUFBQSxJQUFHLEtBQUEsS0FBUyxpQkFBWjtBQUNFLFFBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxDQUFLLCtCQUFMLENBQUg7aUJBQThDLElBQTlDO1NBQUEsTUFBQTtpQkFBdUQsSUFBdkQ7U0FERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsRUFBQSxHQUFHLElBQUMsQ0FBQSxLQUFKLEdBQVUsR0FBVixHQUFhLEtBQTdCLEVBSEY7T0FERztJQUFBLENBRkwsQ0FBQTs7QUFBQSx1QkFRQSxHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO2FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLEVBQUEsR0FBRyxJQUFDLENBQUEsS0FBSixHQUFVLEdBQVYsR0FBYSxLQUE3QixFQUFzQyxLQUF0QyxFQURHO0lBQUEsQ0FSTCxDQUFBOztvQkFBQTs7TUFERixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQVMsZUFBVCxFQUNuQjtBQUFBLElBQUEsa0NBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxT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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/settings.coffee
