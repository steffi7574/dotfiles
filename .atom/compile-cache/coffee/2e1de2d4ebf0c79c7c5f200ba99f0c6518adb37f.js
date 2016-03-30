(function() {
  var BibtexProvider, fs;

  fs = require("fs");

  BibtexProvider = require("./provider");

  module.exports = {
    config: {
      bibtex: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      scope: {
        type: 'string',
        "default": '.source.gfm'
      },
      resultTemplate: {
        type: 'string',
        "default": '@[key]'
      }
    },
    activate: function(state) {
      var bibtexFiles, file, reload, stats, _i, _len;
      reload = false;
      if (state) {
        bibtexFiles = atom.config.get("autocomplete-bibtex.bibtex");
        this.stateTime = state.saveTime;
        if (!Array.isArray(bibtexFiles)) {
          bibtexFiles = [bibtexFiles];
        }
        for (_i = 0, _len = bibtexFiles.length; _i < _len; _i++) {
          file = bibtexFiles[_i];
          stats = fs.statSync(file);
          if (stats.isFile()) {
            if (state.saveTime < stats.mtime.getTime()) {
              reload = true;
              this.stateTime = new Date().getTime();
            }
          }
        }
      }
      if (state && reload === false) {
        this.bibtexProvider = atom.deserializers.deserialize(state.provider);
        if (!this.bibtexProvider) {
          this.bibtexProvider = new BibtexProvider();
        }
      } else {
        this.bibtexProvider = new BibtexProvider();
      }
      return this.provider = this.bibtexProvider.provider;
    },
    deactivate: function() {
      return this.provider.registration.dispose();
    },
    serialize: function() {
      var state, _ref;
      state = {
        provider: this.bibtexProvider.serialize(),
        saveTime: (_ref = this.stateTime) != null ? _ref : new Date().getTime()
      };
      return state;
    },
    provide: function() {
      return {
        providers: [this.provider]
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1iaWJ0ZXgvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLFlBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsTUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtPQURGO0FBQUEsTUFLQSxLQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsYUFEVDtPQU5GO0FBQUEsTUFRQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsUUFEVDtPQVRGO0tBREY7QUFBQSxJQWFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsMENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxLQUFULENBQUE7QUFDQSxNQUFBLElBQUcsS0FBSDtBQUNFLFFBQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FBZCxDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBQUssQ0FBQyxRQUZuQixDQUFBO0FBR0EsUUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLE9BQU4sQ0FBYyxXQUFkLENBQVA7QUFDRSxVQUFBLFdBQUEsR0FBYyxDQUFDLFdBQUQsQ0FBZCxDQURGO1NBSEE7QUFNQSxhQUFBLGtEQUFBO2lDQUFBO0FBQ0UsVUFBQSxLQUFBLEdBQVEsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFaLENBQVIsQ0FBQTtBQUNBLFVBQUEsSUFBRyxLQUFLLENBQUMsTUFBTixDQUFBLENBQUg7QUFDRSxZQUFBLElBQUcsS0FBSyxDQUFDLFFBQU4sR0FBaUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLENBQUEsQ0FBcEI7QUFDRSxjQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxjQUNBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsSUFBQSxDQUFBLENBQU0sQ0FBQyxPQUFQLENBQUEsQ0FEakIsQ0FERjthQURGO1dBRkY7QUFBQSxTQVBGO09BREE7QUFpQkEsTUFBQSxJQUFHLEtBQUEsSUFBVSxNQUFBLEtBQVUsS0FBdkI7QUFDRSxRQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBK0IsS0FBSyxDQUFDLFFBQXJDLENBQWxCLENBQUE7QUFFQSxRQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsY0FBUjtBQUNFLFVBQUEsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxjQUFBLENBQUEsQ0FBdEIsQ0FERjtTQUhGO09BQUEsTUFBQTtBQU1FLFFBQUEsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxjQUFBLENBQUEsQ0FBdEIsQ0FORjtPQWpCQTthQXlCQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxjQUFjLENBQUMsU0ExQnBCO0lBQUEsQ0FiVjtBQUFBLElBeUNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUF2QixDQUFBLEVBRFU7SUFBQSxDQXpDWjtBQUFBLElBNENBLFNBQUEsRUFBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLFdBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUTtBQUFBLFFBQ04sUUFBQSxFQUFVLElBQUMsQ0FBQSxjQUFjLENBQUMsU0FBaEIsQ0FBQSxDQURKO0FBQUEsUUFFTixRQUFBLDJDQUEyQixJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsT0FBUCxDQUFBLENBRnJCO09BQVIsQ0FBQTtBQUlBLGFBQU8sS0FBUCxDQUxTO0lBQUEsQ0E1Q1g7QUFBQSxJQW9EQSxPQUFBLEVBQVMsU0FBQSxHQUFBO0FBQ1AsYUFBTztBQUFBLFFBQUUsU0FBQSxFQUFXLENBQUMsSUFBQyxDQUFBLFFBQUYsQ0FBYjtPQUFQLENBRE87SUFBQSxDQXBEVDtHQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/autocomplete-bibtex/lib/main.coffee
