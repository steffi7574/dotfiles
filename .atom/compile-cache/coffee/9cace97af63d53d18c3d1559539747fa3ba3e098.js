(function() {
  var apm, fs, path;

  fs = require('fs-plus');

  path = require('path');

  apm = require('./apm');

  module.exports = {
    exportConfig: function(backupFile) {
      var atomPath, defaultPath, file, filePath, files, packageName, savedConfig, temp, thePath, _i, _j, _len, _len1, _ref;
      defaultPath = atom.config.get('config-import-export.defaultPath');
      thePath = defaultPath[process.platform];
      if (backupFile == null) {
        backupFile = path.join(thePath, "backup.json");
      }
      atomPath = atom.getConfigDirPath();
      savedConfig = {
        version: 1.02,
        files: [],
        packages: []
      };
      files = fs.readdirSync(atomPath);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        filePath = path.join(atomPath, file);
        if (fs.lstatSync(filePath).isFile()) {
          temp = {
            file: file,
            content: fs.readFileSync(filePath)
          };
          savedConfig.files.push(temp);
        }
      }
      _ref = atom.packages.getAvailablePackageNames();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        packageName = _ref[_j];
        if (atom.packages.isBundledPackage(packageName) === false) {
          savedConfig.packages.push(packageName);
        }
      }
      fs.writeFileSync(backupFile, JSON.stringify(savedConfig));
      console.log(savedConfig);
      return "Exported a config";
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9leHBvcnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxZQUFBLEVBQWMsU0FBQyxVQUFELEdBQUE7QUFDWixVQUFBLGdIQUFBO0FBQUEsTUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFkLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxXQUFZLENBQUEsT0FBTyxDQUFDLFFBQVIsQ0FEdEIsQ0FBQTs7UUFHQSxhQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixhQUFuQjtPQUhkO0FBQUEsTUFLQSxRQUFBLEdBQVcsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FMWCxDQUFBO0FBQUEsTUFNQSxXQUFBLEdBQ0U7QUFBQSxRQUFBLE9BQUEsRUFDRSxJQURGO0FBQUEsUUFFQSxLQUFBLEVBQU8sRUFGUDtBQUFBLFFBR0EsUUFBQSxFQUFVLEVBSFY7T0FQRixDQUFBO0FBQUEsTUFZQSxLQUFBLEdBQVEsRUFBRSxDQUFDLFdBQUgsQ0FBZSxRQUFmLENBWlIsQ0FBQTtBQWdCQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLElBQXBCLENBQVgsQ0FBQTtBQUNBLFFBQUEsSUFBRyxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBLENBQUg7QUFDRSxVQUFBLElBQUEsR0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxZQUNBLE9BQUEsRUFBUyxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixDQURUO1dBREYsQ0FBQTtBQUFBLFVBR0EsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUhBLENBREY7U0FGRjtBQUFBLE9BaEJBO0FBd0JBO0FBQUEsV0FBQSw2Q0FBQTsrQkFBQTtBQUNFLFFBQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLENBQUEsS0FBK0MsS0FBbEQ7QUFDRSxVQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBckIsQ0FBMEIsV0FBMUIsQ0FBQSxDQURGO1NBREY7QUFBQSxPQXhCQTtBQUFBLE1BMkJBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFVBQWpCLEVBQTZCLElBQUksQ0FBQyxTQUFMLENBQWUsV0FBZixDQUE3QixDQTNCQSxDQUFBO0FBQUEsTUE2QkEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxXQUFaLENBN0JBLENBQUE7YUE4QkEsb0JBL0JZO0lBQUEsQ0FBZDtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/export.coffee
