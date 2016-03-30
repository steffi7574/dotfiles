(function() {
  var child_process, notifier, sys;

  notifier = require('./notifier');

  sys = require('sys');

  child_process = require('child_process');

  module.exports = {
    apm: function(_arg) {
      var args, command, cwd, exit, options, out, stderr, stdout, _ref;
      _ref = _arg != null ? _arg : {}, args = _ref.args, cwd = _ref.cwd, options = _ref.options, stdout = _ref.stdout, stderr = _ref.stderr, exit = _ref.exit;
      command = atom.packages.getApmPath();
      if (options == null) {
        options = {};
      }
      if (options.cwd == null) {
        options.cwd = cwd;
      }
      out = child_process.spawnSync(command, args, options);
      console.log(out);
      if (out.stderr.length > 0) {
        notifier.addError(out.stderr.toString(), {
          dismissable: true
        });
      }
      if (out.stdout.length > 0) {
        return notifier.addSuccess(out.stdout.toString(), {
          dismissable: true
        });
      }
    },
    apmAsync: function(_arg) {
      var args, command, cwd, exit, options, out, stderr, stdout, _ref;
      _ref = _arg != null ? _arg : {}, args = _ref.args, cwd = _ref.cwd, options = _ref.options, stdout = _ref.stdout, stderr = _ref.stderr, exit = _ref.exit;
      command = atom.packages.getApmPath();
      if (options == null) {
        options = {};
      }
      if (options.cwd == null) {
        options.cwd = cwd;
      }
      out = child_process.spawn(command, args, options);
      stdout = "";
      stderr = "";
      out.stderr.on('data', function(data) {
        return stderr += data.toString();
      });
      out.stdout.on('data', function(data) {
        return stdout += data.toString();
      });
      return out.on('close', function(code) {
        if (stderr.length > 0) {
          notifier.addError(stderr.toString(), {
            dismissable: true
          });
        }
        if (stdout.length > 0) {
          return notifier.addSuccess(stdout.toString(), {
            dismissable: true
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9hcG0uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUROLENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxlQUFSLENBRmhCLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQyxJQUFELEdBQUE7QUFDSCxVQUFBLDREQUFBO0FBQUEsNEJBREksT0FBMkMsSUFBMUMsWUFBQSxNQUFNLFdBQUEsS0FBSyxlQUFBLFNBQVMsY0FBQSxRQUFRLGNBQUEsUUFBUSxZQUFBLElBQ3pDLENBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWQsQ0FBQSxDQUFWLENBQUE7O1FBQ0EsVUFBVztPQURYOztRQUVBLE9BQU8sQ0FBQyxNQUFPO09BRmY7QUFBQSxNQUdBLEdBQUEsR0FBTSxhQUFhLENBQUMsU0FBZCxDQUF3QixPQUF4QixFQUFpQyxJQUFqQyxFQUF1QyxPQUF2QyxDQUhOLENBQUE7QUFBQSxNQUlBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWixDQUpBLENBQUE7QUFLQSxNQUFBLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFYLEdBQW9CLENBQXhCO0FBQ0UsUUFBQSxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVgsQ0FBQSxDQUFsQixFQUF5QztBQUFBLFVBQUEsV0FBQSxFQUFZLElBQVo7U0FBekMsQ0FBQSxDQURGO09BTEE7QUFPQSxNQUFBLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFYLEdBQW9CLENBQXhCO2VBQ0UsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFYLENBQUEsQ0FBcEIsRUFBMkM7QUFBQSxVQUFBLFdBQUEsRUFBWSxJQUFaO1NBQTNDLEVBREY7T0FSRztJQUFBLENBQUw7QUFBQSxJQVdBLFFBQUEsRUFBVSxTQUFDLElBQUQsR0FBQTtBQUNSLFVBQUEsNERBQUE7QUFBQSw0QkFEUyxPQUEyQyxJQUExQyxZQUFBLE1BQU0sV0FBQSxLQUFLLGVBQUEsU0FBUyxjQUFBLFFBQVEsY0FBQSxRQUFRLFlBQUEsSUFDOUMsQ0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUFBLENBQVYsQ0FBQTs7UUFDQSxVQUFXO09BRFg7O1FBRUEsT0FBTyxDQUFDLE1BQU87T0FGZjtBQUFBLE1BR0EsR0FBQSxHQUFNLGFBQWEsQ0FBQyxLQUFkLENBQW9CLE9BQXBCLEVBQTZCLElBQTdCLEVBQW1DLE9BQW5DLENBSE4sQ0FBQTtBQUFBLE1BSUEsTUFBQSxHQUFTLEVBSlQsQ0FBQTtBQUFBLE1BS0EsTUFBQSxHQUFTLEVBTFQsQ0FBQTtBQUFBLE1BTUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFDLElBQUQsR0FBQTtlQUNwQixNQUFBLElBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBQSxFQURVO01BQUEsQ0FBdEIsQ0FOQSxDQUFBO0FBQUEsTUFRQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUMsSUFBRCxHQUFBO2VBQ3BCLE1BQUEsSUFBVSxJQUFJLENBQUMsUUFBTCxDQUFBLEVBRFU7TUFBQSxDQUF0QixDQVJBLENBQUE7YUFVQSxHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBZ0IsU0FBQyxJQUFELEdBQUE7QUFDZCxRQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7QUFDRSxVQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBbEIsRUFBcUM7QUFBQSxZQUFBLFdBQUEsRUFBYSxJQUFiO1dBQXJDLENBQUEsQ0FERjtTQUFBO0FBRUEsUUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQW5CO2lCQUNFLFFBQVEsQ0FBQyxVQUFULENBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBcEIsRUFBdUM7QUFBQSxZQUFBLFdBQUEsRUFBYSxJQUFiO1dBQXZDLEVBREY7U0FIYztNQUFBLENBQWhCLEVBWFE7SUFBQSxDQVhWO0dBTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/apm.coffee
