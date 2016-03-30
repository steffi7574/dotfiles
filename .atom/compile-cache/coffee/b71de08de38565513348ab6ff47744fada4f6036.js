(function() {
  var CompositeDisposable, FindAndReplace, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  FindAndReplace = null;

  module.exports = MinimapFindAndReplaceBinding = (function() {
    function MinimapFindAndReplaceBinding(minimap, fnrAPI) {
      this.minimap = minimap;
      this.fnrAPI = fnrAPI;
      this.editor = this.minimap.getTextEditor();
      this.subscriptions = new CompositeDisposable;
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      this.discoverMarkers();
      if (this.fnrAPI != null) {
        this.layer = this.fnrAPI.resultsMarkerLayerForTextEditor(this.editor);
        this.subscriptions.add(this.layer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      }
    }

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      var decoration, id, sub, _ref, _ref1;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.decorationsByMarkerId;
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
      }
      this.subscriptions.dispose();
      this.minimap = null;
      this.editor = null;
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    MinimapFindAndReplaceBinding.prototype.clear = function() {
      var decoration, id, sub, _ref, _ref1, _results;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
        delete this.subscriptionsByMarkerId[id];
      }
      _ref1 = this.decorationsByMarkerId;
      _results = [];
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
        _results.push(delete this.decorationsByMarkerId[id]);
      }
      return _results;
    };

    MinimapFindAndReplaceBinding.prototype.findAndReplace = function() {
      return FindAndReplace != null ? FindAndReplace : FindAndReplace = atom.packages.getLoadedPackage('find-and-replace').mainModule;
    };

    MinimapFindAndReplaceBinding.prototype.discoverMarkers = function() {
      var _ref;
      return ((_ref = this.layer) != null ? _ref : this.editor).findMarkers({
        "class": 'find-result'
      }).forEach((function(_this) {
        return function(marker) {
          return _this.createDecoration(marker);
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.handleCreatedMarker = function(marker) {
      var _ref;
      if (((_ref = marker.getProperties()) != null ? _ref["class"] : void 0) === 'find-result') {
        return this.createDecoration(marker);
      }
    };

    MinimapFindAndReplaceBinding.prototype.createDecoration = function(marker) {
      var decoration, id;
      if (!this.findViewIsVisible()) {
        return;
      }
      if (this.decorationsByMarkerId[marker.id] != null) {
        return;
      }
      decoration = this.minimap.decorateMarker(marker, {
        type: 'highlight',
        scope: ".minimap .search-result"
      });
      if (decoration == null) {
        return;
      }
      id = marker.id;
      this.decorationsByMarkerId[id] = decoration;
      return this.subscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.subscriptionsByMarkerId[id];
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      var _ref, _ref1;
      return (_ref = this.findAndReplace()) != null ? (_ref1 = _ref.findView) != null ? _ref1.is(':visible') : void 0 : void 0;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS9saWIvbWluaW1hcC1maW5kLWFuZC1yZXBsYWNlLWJpbmRpbmcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLElBRGpCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxzQ0FBRSxPQUFGLEVBQVksTUFBWixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxNQURzQixJQUFDLENBQUEsU0FBQSxNQUN2QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQURqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFGekIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLHVCQUFELEdBQTJCLEVBSDNCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FMQSxDQUFBO0FBT0EsTUFBQSxJQUFHLG1CQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsSUFBQyxDQUFBLE1BQXpDLENBQVQsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE1BQUQsR0FBQTttQkFDMUMsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCLEVBRDBDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBbkIsQ0FEQSxDQURGO09BQUEsTUFBQTtBQUtFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBYSxDQUFDLGlCQUF0QixDQUF3QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsTUFBRCxHQUFBO21CQUN6RCxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsRUFEeUQ7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxDQUFuQixDQUFBLENBTEY7T0FSVztJQUFBLENBQWI7O0FBQUEsMkNBZ0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGdDQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7dUJBQUE7QUFBQSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FBQTtBQUNBO0FBQUEsV0FBQSxXQUFBOytCQUFBO0FBQUEsUUFBQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBQUEsQ0FBQTtBQUFBLE9BREE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUpYLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFMVixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFOekIsQ0FBQTthQU9BLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixHQVJwQjtJQUFBLENBaEJULENBQUE7O0FBQUEsMkNBMEJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLDBDQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7dUJBQUE7QUFDRSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLHVCQUF3QixDQUFBLEVBQUEsQ0FEaEMsQ0FERjtBQUFBLE9BQUE7QUFJQTtBQUFBO1dBQUEsV0FBQTsrQkFBQTtBQUNFLFFBQUEsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFBLENBQUE7QUFBQSxzQkFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLHFCQUFzQixDQUFBLEVBQUEsRUFEOUIsQ0FERjtBQUFBO3NCQUxLO0lBQUEsQ0ExQlAsQ0FBQTs7QUFBQSwyQ0FtQ0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7c0NBQUcsaUJBQUEsaUJBQWtCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isa0JBQS9CLENBQWtELENBQUMsV0FBeEU7SUFBQSxDQW5DaEIsQ0FBQTs7QUFBQSwyQ0FxQ0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLElBQUE7YUFBQSxzQ0FBVSxJQUFDLENBQUEsTUFBWCxDQUFrQixDQUFDLFdBQW5CLENBQStCO0FBQUEsUUFBQSxPQUFBLEVBQU8sYUFBUDtPQUEvQixDQUFvRCxDQUFDLE9BQXJELENBQTZELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDM0QsS0FBQyxDQUFBLGdCQUFELENBQWtCLE1BQWxCLEVBRDJEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0QsRUFEZTtJQUFBLENBckNqQixDQUFBOztBQUFBLDJDQXlDQSxtQkFBQSxHQUFxQixTQUFDLE1BQUQsR0FBQTtBQUNuQixVQUFBLElBQUE7QUFBQSxNQUFBLG1EQUFtRCxDQUFFLE9BQUYsV0FBdEIsS0FBaUMsYUFBOUQ7ZUFBQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsTUFBbEIsRUFBQTtPQURtQjtJQUFBLENBekNyQixDQUFBOztBQUFBLDJDQTRDQSxnQkFBQSxHQUFrQixTQUFDLE1BQUQsR0FBQTtBQUNoQixVQUFBLGNBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsaUJBQUQsQ0FBQSxDQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFDQSxNQUFBLElBQVUsNkNBQVY7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixNQUF4QixFQUFnQztBQUFBLFFBQzNDLElBQUEsRUFBTSxXQURxQztBQUFBLFFBRTNDLEtBQUEsRUFBTyx5QkFGb0M7T0FBaEMsQ0FIYixDQUFBO0FBT0EsTUFBQSxJQUFjLGtCQUFkO0FBQUEsY0FBQSxDQUFBO09BUEE7QUFBQSxNQVNBLEVBQUEsR0FBSyxNQUFNLENBQUMsRUFUWixDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEscUJBQXNCLENBQUEsRUFBQSxDQUF2QixHQUE2QixVQVY3QixDQUFBO2FBV0EsSUFBQyxDQUFBLHVCQUF3QixDQUFBLEVBQUEsQ0FBekIsR0FBK0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRCxVQUFBLEtBQUMsQ0FBQSx1QkFBd0IsQ0FBQSxFQUFBLENBQUcsQ0FBQyxPQUE3QixDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFBLEtBQVEsQ0FBQSxxQkFBc0IsQ0FBQSxFQUFBLENBRDlCLENBQUE7aUJBRUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSx1QkFBd0IsQ0FBQSxFQUFBLEVBSHFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFaZjtJQUFBLENBNUNsQixDQUFBOztBQUFBLDJDQTZEQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFBRyxVQUFBLFdBQUE7NkZBQTJCLENBQUUsRUFBN0IsQ0FBZ0MsVUFBaEMsb0JBQUg7SUFBQSxDQTdEbkIsQ0FBQTs7d0NBQUE7O01BTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee
