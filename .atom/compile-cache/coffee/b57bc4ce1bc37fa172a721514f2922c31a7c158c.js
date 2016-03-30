(function() {
  var CompositeDisposable, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  MinimapFindAndReplaceBinding = null;

  module.exports = {
    active: false,
    bindingsById: {},
    subscriptionsById: {},
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('find-and-replace', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('find-and-replace');
      return this.minimap = null;
    },
    activatePlugin: function() {
      var fnrHasServiceAPI, fnrVersion;
      if (this.active) {
        return;
      }
      this.active = true;
      fnrVersion = atom.packages.getLoadedPackage('find-and-replace').metadata.version;
      fnrHasServiceAPI = parseFloat(fnrVersion) >= 0.194;
      if (fnrHasServiceAPI) {
        this.initializeServiceAPI();
      } else {
        this.initializeLegacyAPI();
      }
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'find-and-replace:show': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:toggle': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:show-replace': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this),
        'core:close': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this)
      }));
    },
    initializeServiceAPI: function() {
      return atom.packages.serviceHub.consume('find-and-replace', '0.0.1', (function(_this) {
        return function(fnr) {
          return _this.subscriptions.add(_this.minimap.observeMinimaps(function(minimap) {
            var binding, id;
            if (MinimapFindAndReplaceBinding == null) {
              MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
            }
            id = minimap.id;
            binding = new MinimapFindAndReplaceBinding(minimap, fnr);
            _this.bindingsById[id] = binding;
            return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
              var _ref, _ref1;
              if ((_ref = _this.subscriptionsById[id]) != null) {
                _ref.dispose();
              }
              if ((_ref1 = _this.bindingsById[id]) != null) {
                _ref1.destroy();
              }
              delete _this.bindingsById[id];
              return delete _this.subscriptionsById[id];
            });
          }));
        };
      })(this));
    },
    initializeLegacyAPI: function() {
      return this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var binding, id;
          if (MinimapFindAndReplaceBinding == null) {
            MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
          }
          id = minimap.id;
          binding = new MinimapFindAndReplaceBinding(minimap);
          _this.bindingsById[id] = binding;
          return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
            var _ref, _ref1;
            if ((_ref = _this.subscriptionsById[id]) != null) {
              _ref.dispose();
            }
            if ((_ref1 = _this.bindingsById[id]) != null) {
              _ref1.destroy();
            }
            delete _this.bindingsById[id];
            return delete _this.subscriptionsById[id];
          });
        };
      })(this)));
    },
    deactivatePlugin: function() {
      var binding, id, sub, _ref, _ref1;
      if (!this.active) {
        return;
      }
      this.active = false;
      this.subscriptions.dispose();
      _ref = this.subscriptionsById;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.bindingsById;
      for (id in _ref1) {
        binding = _ref1[id];
        binding.destroy();
      }
      this.bindingsById = {};
      return this.subscriptionsById = {};
    },
    discoverMarkers: function() {
      var binding, id, _ref, _results;
      _ref = this.bindingsById;
      _results = [];
      for (id in _ref) {
        binding = _ref[id];
        _results.push(binding.discoverMarkers());
      }
      return _results;
    },
    clearBindings: function() {
      var binding, id, _ref, _results;
      _ref = this.bindingsById;
      _results = [];
      for (id in _ref) {
        binding = _ref[id];
        _results.push(binding.clear());
      }
      return _results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS9saWIvbWluaW1hcC1maW5kLWFuZC1yZXBsYWNlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsNEJBQUEsR0FBK0IsSUFEL0IsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxLQUFSO0FBQUEsSUFDQSxZQUFBLEVBQWMsRUFEZDtBQUFBLElBRUEsaUJBQUEsRUFBbUIsRUFGbkI7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsT0FBSjtJQUFBLENBSlY7QUFBQSxJQU1BLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxvQkFEVDtJQUFBLENBTlY7QUFBQSxJQVNBLHVCQUFBLEVBQXlCLFNBQUUsT0FBRixHQUFBO0FBQ3ZCLE1BRHdCLElBQUMsQ0FBQSxVQUFBLE9BQ3pCLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0Isa0JBQXhCLEVBQTRDLElBQTVDLEVBRHVCO0lBQUEsQ0FUekI7QUFBQSxJQVlBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FGRDtJQUFBLENBWlo7QUFBQSxJQWdCQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsNEJBQUE7QUFBQSxNQUFBLElBQVUsSUFBQyxDQUFBLE1BQVg7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUZWLENBQUE7QUFBQSxNQUlBLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGtCQUEvQixDQUFrRCxDQUFDLFFBQVEsQ0FBQyxPQUp6RSxDQUFBO0FBQUEsTUFLQSxnQkFBQSxHQUFtQixVQUFBLENBQVcsVUFBWCxDQUFBLElBQTBCLEtBTDdDLENBQUE7QUFPQSxNQUFBLElBQUcsZ0JBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FIRjtPQVBBO2FBWUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7QUFBQSxRQUFBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0FBQUEsUUFDQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUQzQjtBQUFBLFFBRUEsK0JBQUEsRUFBaUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGakM7QUFBQSxRQUdBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhmO0FBQUEsUUFJQSxZQUFBLEVBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKZDtPQURpQixDQUFuQixFQWJjO0lBQUEsQ0FoQmhCO0FBQUEsSUFvQ0Esb0JBQUEsRUFBc0IsU0FBQSxHQUFBO2FBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQXpCLENBQWlDLGtCQUFqQyxFQUFxRCxPQUFyRCxFQUE4RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEdBQUE7aUJBQzVELEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixLQUFDLENBQUEsT0FBTyxDQUFDLGVBQVQsQ0FBeUIsU0FBQyxPQUFELEdBQUE7QUFDMUMsZ0JBQUEsV0FBQTs7Y0FBQSwrQkFBZ0MsT0FBQSxDQUFRLG9DQUFSO2FBQWhDO0FBQUEsWUFFQSxFQUFBLEdBQUssT0FBTyxDQUFDLEVBRmIsQ0FBQTtBQUFBLFlBR0EsT0FBQSxHQUFjLElBQUEsNEJBQUEsQ0FBNkIsT0FBN0IsRUFBc0MsR0FBdEMsQ0FIZCxDQUFBO0FBQUEsWUFJQSxLQUFDLENBQUEsWUFBYSxDQUFBLEVBQUEsQ0FBZCxHQUFvQixPQUpwQixDQUFBO21CQU1BLEtBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxFQUFBLENBQW5CLEdBQXlCLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFNBQUEsR0FBQTtBQUM1QyxrQkFBQSxXQUFBOztvQkFBc0IsQ0FBRSxPQUF4QixDQUFBO2VBQUE7O3FCQUNpQixDQUFFLE9BQW5CLENBQUE7ZUFEQTtBQUFBLGNBR0EsTUFBQSxDQUFBLEtBQVEsQ0FBQSxZQUFhLENBQUEsRUFBQSxDQUhyQixDQUFBO3FCQUlBLE1BQUEsQ0FBQSxLQUFRLENBQUEsaUJBQWtCLENBQUEsRUFBQSxFQUxrQjtZQUFBLENBQXJCLEVBUGlCO1VBQUEsQ0FBekIsQ0FBbkIsRUFENEQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RCxFQURvQjtJQUFBLENBcEN0QjtBQUFBLElBb0RBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTthQUNuQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUMxQyxjQUFBLFdBQUE7O1lBQUEsK0JBQWdDLE9BQUEsQ0FBUSxvQ0FBUjtXQUFoQztBQUFBLFVBRUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxFQUZiLENBQUE7QUFBQSxVQUdBLE9BQUEsR0FBYyxJQUFBLDRCQUFBLENBQTZCLE9BQTdCLENBSGQsQ0FBQTtBQUFBLFVBSUEsS0FBQyxDQUFBLFlBQWEsQ0FBQSxFQUFBLENBQWQsR0FBb0IsT0FKcEIsQ0FBQTtpQkFNQSxLQUFDLENBQUEsaUJBQWtCLENBQUEsRUFBQSxDQUFuQixHQUF5QixPQUFPLENBQUMsWUFBUixDQUFxQixTQUFBLEdBQUE7QUFDNUMsZ0JBQUEsV0FBQTs7a0JBQXNCLENBQUUsT0FBeEIsQ0FBQTthQUFBOzttQkFDaUIsQ0FBRSxPQUFuQixDQUFBO2FBREE7QUFBQSxZQUdBLE1BQUEsQ0FBQSxLQUFRLENBQUEsWUFBYSxDQUFBLEVBQUEsQ0FIckIsQ0FBQTttQkFJQSxNQUFBLENBQUEsS0FBUSxDQUFBLGlCQUFrQixDQUFBLEVBQUEsRUFMa0I7VUFBQSxDQUFyQixFQVBpQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBQW5CLEVBRG1CO0lBQUEsQ0FwRHJCO0FBQUEsSUFtRUEsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsNkJBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsTUFBZjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FIQSxDQUFBO0FBS0E7QUFBQSxXQUFBLFVBQUE7dUJBQUE7QUFBQSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FMQTtBQU1BO0FBQUEsV0FBQSxXQUFBOzRCQUFBO0FBQUEsUUFBQSxPQUFPLENBQUMsT0FBUixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BTkE7QUFBQSxNQVFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBUmhCLENBQUE7YUFTQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsR0FWTDtJQUFBLENBbkVsQjtBQUFBLElBK0VBLGVBQUEsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSwyQkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBOzJCQUFBO0FBQUEsc0JBQUEsT0FBTyxDQUFDLGVBQVIsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFEZTtJQUFBLENBL0VqQjtBQUFBLElBa0ZBLGFBQUEsRUFBZSxTQUFBLEdBQUE7QUFDYixVQUFBLDJCQUFBO0FBQUE7QUFBQTtXQUFBLFVBQUE7MkJBQUE7QUFBQSxzQkFBQSxPQUFPLENBQUMsS0FBUixDQUFBLEVBQUEsQ0FBQTtBQUFBO3NCQURhO0lBQUEsQ0FsRmY7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace.coffee
