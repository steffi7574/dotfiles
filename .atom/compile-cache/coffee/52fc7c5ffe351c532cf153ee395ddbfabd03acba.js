(function() {
  var fs, latexCommandPattern, parse_tex_directives, texDirectivePattern,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  texDirectivePattern = /%\s*!(?:T|t)(?:E|e)(?:X|x)\s+([\w-]+)\s*=\s*(.*?)\s*$/;

  latexCommandPattern = /\\[a-zA-Z]+\*?(?:\[[^\]]+\])*\{[^\}]+\}/;

  module.exports = parse_tex_directives = function(editorOrPath, multiValues, keyMaps) {
    var key, line, lines, match, result, _i, _len;
    if (multiValues == null) {
      multiValues = [];
    }
    if (keyMaps == null) {
      keyMaps = {};
    }
    result = {};
    lines = typeof editorOrPath === 'string' ? fs.readFileSync(editorOrPath, 'utf8').toString().split('\n') : editorOrPath.getBuffer().getLines();
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      if (line.match(latexCommandPattern)) {
        break;
      }
      match = line.match(texDirectivePattern);
      if (match != null) {
        key = match[1].toLowerCase();
        if (key in keyMaps) {
          key = keyMaps[key];
        }
        if (__indexOf.call(multiValues, key) >= 0) {
          if (key in result) {
            result[key].push(match[2]);
          } else {
            result[key] = [match[2]];
          }
        } else {
          result[key] = match[2];
        }
      }
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3BhcnNlcnMvdGV4LWRpcmVjdGl2ZS1wYXJzZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBRUEsbUJBQUEsR0FBc0IsdURBRnRCLENBQUE7O0FBQUEsRUFHQSxtQkFBQSxHQUFzQix5Q0FIdEIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLG9CQUFBLEdBQ2YsU0FBQyxZQUFELEVBQWUsV0FBZixFQUFpQyxPQUFqQyxHQUFBO0FBRUUsUUFBQSx5Q0FBQTs7TUFGYSxjQUFjO0tBRTNCOztNQUYrQixVQUFVO0tBRXpDO0FBQUEsSUFBQSxNQUFBLEdBQWMsRUFBZCxDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQ0ssTUFBQSxDQUFBLFlBQUEsS0FBd0IsUUFBM0IsR0FFRSxFQUFFLENBQUMsWUFBSCxDQUFnQixZQUFoQixFQUE4QixNQUE5QixDQUFxQyxDQUFDLFFBQXRDLENBQUEsQ0FBZ0QsQ0FBQyxLQUFqRCxDQUF1RCxJQUF2RCxDQUZGLEdBSUUsWUFBWSxDQUFDLFNBQWIsQ0FBQSxDQUF3QixDQUFDLFFBQXpCLENBQUEsQ0FQSixDQUFBO0FBVUEsU0FBQSw0Q0FBQTt1QkFBQTtBQUNFLE1BQUEsSUFBUyxJQUFJLENBQUMsS0FBTCxDQUFXLG1CQUFYLENBQVQ7QUFBQSxjQUFBO09BQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLG1CQUFYLENBRFIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxhQUFIO0FBQ0UsUUFBQSxHQUFBLEdBQU0sS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVQsQ0FBQSxDQUFOLENBQUE7QUFDQSxRQUFBLElBQUcsR0FBQSxJQUFPLE9BQVY7QUFDRSxVQUFBLEdBQUEsR0FBTSxPQUFRLENBQUEsR0FBQSxDQUFkLENBREY7U0FEQTtBQUlBLFFBQUEsSUFBRyxlQUFPLFdBQVAsRUFBQSxHQUFBLE1BQUg7QUFDRSxVQUFBLElBQUcsR0FBQSxJQUFPLE1BQVY7QUFDRSxZQUFBLE1BQU8sQ0FBQSxHQUFBLENBQUksQ0FBQyxJQUFaLENBQWlCLEtBQU0sQ0FBQSxDQUFBLENBQXZCLENBQUEsQ0FERjtXQUFBLE1BQUE7QUFHRSxZQUFBLE1BQU8sQ0FBQSxHQUFBLENBQVAsR0FBYyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVAsQ0FBZCxDQUhGO1dBREY7U0FBQSxNQUFBO0FBTUUsVUFBQSxNQUFPLENBQUEsR0FBQSxDQUFQLEdBQWMsS0FBTSxDQUFBLENBQUEsQ0FBcEIsQ0FORjtTQUxGO09BSEY7QUFBQSxLQVZBO0FBMEJBLFdBQU8sTUFBUCxDQTVCRjtFQUFBLENBTkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/parsers/tex-directive-parser.coffee
