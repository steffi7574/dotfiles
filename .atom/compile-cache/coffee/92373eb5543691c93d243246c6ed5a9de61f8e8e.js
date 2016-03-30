(function() {
  var apm, fs, path;

  fs = require('fs-plus');

  path = require('path');

  apm = require('./apm');

  module.exports = {
    importConfig: function(backupFile) {
      var atomPath, defaultPath, file, fileContents, install, pkg, readConfig, thePath, _i, _j, _len, _len1, _ref, _ref1;
      if (backupFile == null) {
        backupFile = "backup.json";
      }
      console.log("Import Config Called");
      atomPath = atom.getConfigDirPath();
      defaultPath = atom.config.get('config-import-export.defaultPath');
      thePath = defaultPath[process.platform];
      fileContents = fs.readFileSync(path.join(thePath, backupFile));
      readConfig = JSON.parse(fileContents);
      _ref = readConfig.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        fs.writeFileSync(path.join(atomPath, file.file), new Buffer(file.content));
      }
      _ref1 = readConfig.packages;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        pkg = _ref1[_j];
        console.log(pkg);
        install = {
          options: {
            cwd: atom.project.getPaths[0],
            env: process.env
          },
          args: ["install", pkg]
        };
        apm.apmAsync(install);
      }
      return "Imported a config";
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9pbXBvcnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxZQUFBLEVBQWMsU0FBQyxVQUFELEdBQUE7QUFDWixVQUFBLDhHQUFBOztRQURhLGFBQWE7T0FDMUI7QUFBQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FEWCxDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUhkLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxXQUFZLENBQUEsT0FBTyxDQUFDLFFBQVIsQ0FKdEIsQ0FBQTtBQUFBLE1BTUEsWUFBQSxHQUFlLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixVQUFuQixDQUFoQixDQU5mLENBQUE7QUFBQSxNQU9BLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBTCxDQUFXLFlBQVgsQ0FQYixDQUFBO0FBUUE7QUFBQSxXQUFBLDJDQUFBO3dCQUFBO0FBQ0UsUUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsSUFBSSxDQUFDLElBQXpCLENBQWpCLEVBQXFELElBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxPQUFaLENBQXJELENBQUEsQ0FERjtBQUFBLE9BUkE7QUFXQTtBQUFBLFdBQUEsOENBQUE7d0JBQUE7QUFDRSxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWixDQUFBLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FDRTtBQUFBLFVBQUEsT0FBQSxFQUNFO0FBQUEsWUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUEzQjtBQUFBLFlBQ0EsR0FBQSxFQUFLLE9BQU8sQ0FBQyxHQURiO1dBREY7QUFBQSxVQUdBLElBQUEsRUFBTSxDQUFDLFNBQUQsRUFBWSxHQUFaLENBSE47U0FGRixDQUFBO0FBQUEsUUFNQSxHQUFHLENBQUMsUUFBSixDQUFhLE9BQWIsQ0FOQSxDQURGO0FBQUEsT0FYQTthQW1CQSxvQkFwQlk7SUFBQSxDQUFkO0dBTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/import.coffee
