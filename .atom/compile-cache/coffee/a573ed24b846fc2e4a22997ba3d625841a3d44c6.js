(function() {
  var TagGenerator, ctags, fs, getTagsFile, matchOpt, path;

  TagGenerator = require('./tag-generator');

  ctags = require('ctags');

  fs = require("fs");

  path = require("path");

  getTagsFile = function(directoryPath) {
    var tagsFile;
    tagsFile = path.join(directoryPath, ".tags");
    if (fs.existsSync(tagsFile)) {
      return tagsFile;
    }
  };

  matchOpt = {
    matchBase: true
  };

  module.exports = {
    activate: function() {
      this.cachedTags = {};
      return this.extraTags = {};
    },
    deactivate: function() {
      return this.cachedTags = null;
    },
    initTags: function(paths, auto) {
      var p, tagsFile, _i, _len, _results;
      if (paths.length === 0) {
        return;
      }
      this.cachedTags = {};
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        tagsFile = getTagsFile(p);
        if (tagsFile) {
          _results.push(this.readTags(tagsFile, this.cachedTags));
        } else {
          if (auto) {
            _results.push(this.generateTags(p));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    },
    initExtraTags: function(paths) {
      var p, _i, _len, _results;
      this.extraTags = {};
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        p = p.trim();
        if (!p) {
          continue;
        }
        _results.push(this.readTags(p, this.extraTags));
      }
      return _results;
    },
    readTags: function(p, container, callback) {
      var startTime, stream;
      console.log("[atom-ctags:readTags] " + p + " start...");
      startTime = Date.now();
      stream = ctags.createReadStream(p);
      stream.on('error', function(error) {
        return console.error('atom-ctags: ', error);
      });
      stream.on('data', function(tags) {
        var data, tag, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          tag = tags[_i];
          if (!tag.pattern) {
            continue;
          }
          data = container[tag.file];
          if (!data) {
            data = [];
            container[tag.file] = data;
          }
          _results.push(data.push(tag));
        }
        return _results;
      });
      return stream.on('end', function() {
        console.log("[atom-ctags:readTags] " + p + " cost: " + (Date.now() - startTime) + "ms");
        return typeof callback === "function" ? callback() : void 0;
      });
    },
    findTags: function(prefix, options) {
      var tags;
      tags = [];
      if (this.findOf(this.cachedTags, tags, prefix, options)) {
        return tags;
      }
      if (this.findOf(this.extraTags, tags, prefix, options)) {
        return tags;
      }
      if (tags.length === 0) {
        console.warn("[atom-ctags:findTags] tags empty, did you RebuildTags or set extraTagFiles?");
      }
      return tags;
    },
    findOf: function(source, tags, prefix, options) {
      var key, tag, value, _i, _len;
      for (key in source) {
        value = source[key];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          tag = value[_i];
          if ((options != null ? options.partialMatch : void 0) && tag.name.indexOf(prefix) === 0) {
            tags.push(tag);
          } else if (tag.name === prefix) {
            tags.push(tag);
          }
          if ((options != null ? options.maxItems : void 0) && tags.length === options.maxItems) {
            return true;
          }
        }
      }
      return false;
    },
    generateTags: function(p, isAppend, callback) {
      var cmdArgs, startTime;
      delete this.cachedTags[p];
      startTime = Date.now();
      console.log("[atom-ctags:rebuild] start @" + p + "@ tags...");
      cmdArgs = atom.config.get("atom-ctags.cmdArgs");
      if (cmdArgs) {
        cmdArgs = cmdArgs.split(" ");
      }
      return TagGenerator(p, isAppend, this.cmdArgs || cmdArgs, (function(_this) {
        return function(tagpath) {
          console.log("[atom-ctags:rebuild] command done @" + p + "@ tags. cost: " + (Date.now() - startTime) + "ms");
          startTime = Date.now();
          return _this.readTags(tagpath, _this.cachedTags, callback);
        };
      })(this));
    },
    getOrCreateTags: function(filePath, callback) {
      var tags;
      tags = this.cachedTags[filePath];
      if (tags) {
        return typeof callback === "function" ? callback(tags) : void 0;
      }
      return this.generateTags(filePath, true, (function(_this) {
        return function() {
          tags = _this.cachedTags[filePath];
          return typeof callback === "function" ? callback(tags) : void 0;
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2N0YWdzLWNhY2hlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FBZixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBS0EsV0FBQSxHQUFjLFNBQUMsYUFBRCxHQUFBO0FBQ1osUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLEVBQXlCLE9BQXpCLENBQVgsQ0FBQTtBQUNBLElBQUEsSUFBbUIsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQW5CO0FBQUEsYUFBTyxRQUFQLENBQUE7S0FGWTtFQUFBLENBTGQsQ0FBQTs7QUFBQSxFQVNBLFFBQUEsR0FBVztBQUFBLElBQUMsU0FBQSxFQUFXLElBQVo7R0FUWCxDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFkLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBRkw7SUFBQSxDQUFWO0FBQUEsSUFJQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQURKO0lBQUEsQ0FKWjtBQUFBLElBT0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNS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

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/ctags-cache.coffee
