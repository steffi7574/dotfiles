(function() {
  var Tags, es;

  Tags = require(process.resourcesPath + '/app.asar.unpacked/node_modules/symbols-view/node_modules/ctags/build/Release/ctags.node').Tags;

  es = require('event-stream');

  exports.findTags = function(tagsFilePath, tag, options, callback) {
    var caseInsensitive, partialMatch, tagsWrapper, _ref;
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    if (typeof tag !== 'string') {
      throw new TypeError('tag must be a string');
    }
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    _ref = options != null ? options : {}, partialMatch = _ref.partialMatch, caseInsensitive = _ref.caseInsensitive;
    tagsWrapper = new Tags(tagsFilePath);
    tagsWrapper.findTags(tag, partialMatch, caseInsensitive, function(error, tags) {
      tagsWrapper.end();
      return typeof callback === "function" ? callback(error, tags) : void 0;
    });
    return void 0;
  };

  exports.createReadStream = function(tagsFilePath, options) {
    var chunkSize, tagsWrapper;
    if (options == null) {
      options = {};
    }
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    chunkSize = options.chunkSize;
    if (typeof chunkSize !== 'number') {
      chunkSize = 100;
    }
    tagsWrapper = new Tags(tagsFilePath);
    return es.readable(function(count, callback) {
      if (!tagsWrapper.exists()) {
        return callback(new Error("Tags file could not be opened: " + tagsFilePath));
      }
      return tagsWrapper.getTags(chunkSize, (function(_this) {
        return function(error, tags) {
          if ((error != null) || tags.length === 0) {
            tagsWrapper.end();
          }
          callback(error, tags);
          if ((error != null) || tags.length === 0) {
            return _this.emit('end');
          }
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3Mvbm9kZV9tb2R1bGVzL2N0YWdzL3NyYy9jdGFncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLE9BQU8sQ0FBQyxhQUFSLEdBQXdCLDBGQUFoQyxFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsY0FBUixDQURMLENBQUE7O0FBQUEsRUFHQSxPQUFPLENBQUMsUUFBUixHQUFtQixTQUFDLFlBQUQsRUFBZSxHQUFmLEVBQW9CLE9BQXBCLEVBQTZCLFFBQTdCLEdBQUE7QUFDakIsUUFBQSxnREFBQTtBQUFBLElBQUEsSUFBTyxNQUFBLENBQUEsWUFBQSxLQUF1QixRQUE5QjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsK0JBQVYsQ0FBVixDQURGO0tBQUE7QUFHQSxJQUFBLElBQU8sTUFBQSxDQUFBLEdBQUEsS0FBYyxRQUFyQjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsc0JBQVYsQ0FBVixDQURGO0tBSEE7QUFNQSxJQUFBLElBQUcsTUFBQSxDQUFBLE9BQUEsS0FBa0IsVUFBckI7QUFDRSxNQUFBLFFBQUEsR0FBVyxPQUFYLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxJQURWLENBREY7S0FOQTtBQUFBLElBVUEseUJBQWtDLFVBQVUsRUFBNUMsRUFBQyxvQkFBQSxZQUFELEVBQWUsdUJBQUEsZUFWZixDQUFBO0FBQUEsSUFZQSxXQUFBLEdBQWtCLElBQUEsSUFBQSxDQUFLLFlBQUwsQ0FabEIsQ0FBQTtBQUFBLElBYUEsV0FBVyxDQUFDLFFBQVosQ0FBcUIsR0FBckIsRUFBMEIsWUFBMUIsRUFBd0MsZUFBeEMsRUFBeUQsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ3ZELE1BQUEsV0FBVyxDQUFDLEdBQVosQ0FBQSxDQUFBLENBQUE7OENBQ0EsU0FBVSxPQUFPLGVBRnNDO0lBQUEsQ0FBekQsQ0FiQSxDQUFBO1dBaUJBLE9BbEJpQjtFQUFBLENBSG5CLENBQUE7O0FBQUEsRUF1QkEsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLFNBQUMsWUFBRCxFQUFlLE9BQWYsR0FBQTtBQUN6QixRQUFBLHNCQUFBOztNQUR3QyxVQUFRO0tBQ2hEO0FBQUEsSUFBQSxJQUFPLE1BQUEsQ0FBQSxZQUFBLEtBQXVCLFFBQTlCO0FBQ0UsWUFBVSxJQUFBLFNBQUEsQ0FBVSwrQkFBVixDQUFWLENBREY7S0FBQTtBQUFBLElBR0MsWUFBYSxRQUFiLFNBSEQsQ0FBQTtBQUlBLElBQUEsSUFBbUIsTUFBQSxDQUFBLFNBQUEsS0FBc0IsUUFBekM7QUFBQSxNQUFBLFNBQUEsR0FBWSxHQUFaLENBQUE7S0FKQTtBQUFBLElBTUEsV0FBQSxHQUFrQixJQUFBLElBQUEsQ0FBSyxZQUFMLENBTmxCLENBQUE7V0FPQSxFQUFFLENBQUMsUUFBSCxDQUFZLFNBQUMsS0FBRCxFQUFRLFFBQVIsR0FBQTtBQUNWLE1BQUEsSUFBQSxDQUFBLFdBQWtCLENBQUMsTUFBWixDQUFBLENBQVA7QUFDRSxlQUFPLFFBQUEsQ0FBYSxJQUFBLEtBQUEsQ0FBTyxpQ0FBQSxHQUFpQyxZQUF4QyxDQUFiLENBQVAsQ0FERjtPQUFBO2FBR0EsV0FBVyxDQUFDLE9BQVosQ0FBb0IsU0FBcEIsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUM3QixVQUFBLElBQXFCLGVBQUEsSUFBVSxJQUFJLENBQUMsTUFBTCxLQUFlLENBQTlDO0FBQUEsWUFBQSxXQUFXLENBQUMsR0FBWixDQUFBLENBQUEsQ0FBQTtXQUFBO0FBQUEsVUFDQSxRQUFBLENBQVMsS0FBVCxFQUFnQixJQUFoQixDQURBLENBQUE7QUFFQSxVQUFBLElBQWdCLGVBQUEsSUFBVSxJQUFJLENBQUMsTUFBTCxLQUFlLENBQXpDO21CQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBTixFQUFBO1dBSDZCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsRUFKVTtJQUFBLENBQVosRUFSeUI7RUFBQSxDQXZCM0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/node_modules/ctags/src/ctags.coffee
