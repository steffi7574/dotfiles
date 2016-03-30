(function() {
  var fs, path;

  fs = require("fs-plus");

  path = require("path");

  module.exports = {
    repositoryForPath: function(goalPath) {
      var directory, i, _i, _len, _ref;
      _ref = atom.project.getDirectories();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        directory = _ref[i];
        if (goalPath === directory.getPath() || directory.contains(goalPath)) {
          return atom.project.getRepositories()[i];
        }
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZ2l0LWRpZmYvbGliL2hlbHBlcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGlCQUFBLEVBQW1CLFNBQUMsUUFBRCxHQUFBO0FBQ2pCLFVBQUEsNEJBQUE7QUFBQTtBQUFBLFdBQUEsbURBQUE7NEJBQUE7QUFDRSxRQUFBLElBQUcsUUFBQSxLQUFZLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBWixJQUFtQyxTQUFTLENBQUMsUUFBVixDQUFtQixRQUFuQixDQUF0QztBQUNFLGlCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBYixDQUFBLENBQStCLENBQUEsQ0FBQSxDQUF0QyxDQURGO1NBREY7QUFBQSxPQUFBO2FBR0EsS0FKaUI7SUFBQSxDQUFuQjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/minimap-git-diff/lib/helpers.coffee
